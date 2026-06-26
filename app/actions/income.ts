"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { IncomeSource } from "@prisma/client";
import { INCOME_SOURCE_ORDER } from "@/lib/constants";

export async function getIncomeEstimates() {
  const rows = await prisma.incomeEstimate.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.source, r]));

  return INCOME_SOURCE_ORDER.map((source) => ({
    source,
    id: map[source]?.id ?? null,
    estimated_amount: Number(map[source]?.estimated_amount ?? 0),
  }));
}

export async function upsertIncomeEstimate(
  source: IncomeSource,
  estimated_amount: number
) {
  await prisma.incomeEstimate.upsert({
    where: { source },
    update: { estimated_amount },
    create: { source, estimated_amount },
  });
  revalidatePath("/income");
  revalidatePath("/");
}

export async function getIncomeStats() {
  const [estimates, allProjects] = await Promise.all([
    prisma.incomeEstimate.findMany(),
    prisma.project.findMany({
      include: {
        fundings: true,
        expenses: true,
        activities: { include: { expenses: true } },
      },
    }),
  ]);

  // Total disbursed per project (project-level expenses + all activity expenses).
  // Since expenses aren't tagged to a specific source, a project's disbursement
  // is attributed to each of its funding sources proportionally to that source's
  // share of the project's total funded budget.
  return INCOME_SOURCE_ORDER.map((source) => {
    const est = estimates.find((e) => e.source === source);
    const estimated = Number(est?.estimated_amount ?? 0);

    let allocated = 0;
    let disbursed = 0;
    const items: {
      id: string;
      title: string;
      allocated_budget: number;
      type: "project";
      category: string;
      parentTitle: string | null;
      parentId: string | null;
    }[] = [];

    for (const p of allProjects) {
      const funding = p.fundings.find((f) => f.source === source);
      if (!funding) continue;

      const fundedHere = Number(funding.allocated_budget);
      const projectTotal = p.fundings.reduce(
        (s, f) => s + Number(f.allocated_budget),
        0
      );

      const projDisbursed =
        p.expenses.reduce((x, e) => x + Number(e.amount), 0) +
        p.activities.reduce(
          (a, act) => a + act.expenses.reduce((x, e) => x + Number(e.amount), 0),
          0
        );

      const share = projectTotal > 0 ? fundedHere / projectTotal : 0;

      allocated += fundedHere;
      disbursed += projDisbursed * share;

      items.push({
        id: p.id,
        title: p.title,
        allocated_budget: fundedHere,
        type: "project",
        category: p.category,
        parentTitle: null,
        parentId: null,
      });
    }

    return {
      source,
      estimated,
      allocated,
      disbursed,
      remaining: estimated - allocated,
      items,
    };
  });
}
