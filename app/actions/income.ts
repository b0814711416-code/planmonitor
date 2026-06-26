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
  const estimates = await prisma.incomeEstimate.findMany({
    include: {
      projects: {
        include: {
          expenses: true,
          activities: { include: { expenses: true } },
        },
      },
      activities: { include: { expenses: true } },
    },
  });

  const allProjects = await prisma.project.findMany({
    include: {
      expenses: true,
      activities: { include: { expenses: true } },
    },
  });

  return INCOME_SOURCE_ORDER.map((source) => {
    const est = estimates.find((e) => e.source === source);
    const estimated = Number(est?.estimated_amount ?? 0);

    // projects with this income source
    const linkedProjects = allProjects.filter((p) => p.income_source === source);
    const allocated = linkedProjects.reduce(
      (s, p) => s + Number(p.allocated_budget),
      0
    );
    const disbursed = linkedProjects.reduce((s, p) => {
      const projExp = p.expenses.reduce((x, e) => x + Number(e.amount), 0);
      // exclude activity expenses that have a different income_source override
      // (those are counted under their own income source instead)
      const actExp = p.activities
        .filter((act) => !act.income_source || act.income_source === source)
        .reduce((a, act) => a + act.expenses.reduce((x, e) => x + Number(e.amount), 0), 0);
      return s + projExp + actExp;
    }, 0);

    // activities that override income source — only those whose parent project
    // has a DIFFERENT income source (to avoid double-counting project budget)
    const linkedActivities = allProjects
      .flatMap((p) => p.activities.map((a) => ({ ...a, _parentSource: p.income_source })))
      .filter((a) => a.income_source === source && a._parentSource !== source);
    const actAllocated = linkedActivities.reduce(
      (s, a) => s + Number(a.allocated_budget),
      0
    );
    const actDisbursed = linkedActivities.reduce(
      (s, a) => s + a.expenses.reduce((x, e) => x + Number(e.amount), 0),
      0
    );

    const totalAllocated = allocated + actAllocated;
    const totalDisbursed = disbursed + actDisbursed;

    const projectItems = linkedProjects.map((p) => ({
      id: p.id,
      title: p.title,
      allocated_budget: Number(p.allocated_budget),
      type: "project" as const,
      category: p.category,
      parentTitle: null as string | null,
      parentId: null as string | null,
    }));

    const activityItems = linkedActivities.map((a) => {
      const parent = allProjects.find((p) =>
        p.activities.some((act) => act.id === a.id)
      );
      return {
        id: a.id,
        title: a.title,
        allocated_budget: Number(a.allocated_budget),
        type: "activity" as const,
        category: parent?.category ?? ("GENERAL" as string),
        parentTitle: parent?.title ?? null,
        parentId: parent?.id ?? null,
      };
    });

    return {
      source,
      estimated,
      allocated: totalAllocated,
      disbursed: totalDisbursed,
      remaining: estimated - totalAllocated,
      items: [...projectItems, ...activityItems],
    };
  });
}
