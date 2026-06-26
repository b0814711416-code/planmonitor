"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Category, IncomeSource } from "@prisma/client";

export async function getProjects() {
  return prisma.project.findMany({
    include: {
      expenses: true,
      fundings: true,
    },
    orderBy: { created_at: "desc" },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      fundings: true,
      activities: {
        orderBy: { created_at: "asc" },
        include: {
          expenses: {
            orderBy: { disbursed_date: "desc" },
            include: { attachments: true },
          },
        },
      },
      expenses: {
        where: { activity_id: null },
        orderBy: { disbursed_date: "desc" },
        include: { attachments: true },
      },
    },
  });
}

export type FundingInput = {
  source: IncomeSource;
  allocated_budget: number;
};

// Collapse duplicate sources and drop empty lines; the project's total budget
// is always the sum of its funding lines.
function normalizeFundings(fundings: FundingInput[]): FundingInput[] {
  const bySource = new Map<IncomeSource, number>();
  for (const f of fundings) {
    if (!f.source) continue;
    bySource.set(f.source, (bySource.get(f.source) ?? 0) + (f.allocated_budget || 0));
  }
  return [...bySource.entries()].map(([source, allocated_budget]) => ({
    source,
    allocated_budget,
  }));
}

export async function createProject(data: {
  title: string;
  category: Category;
  fundings: FundingInput[];
}) {
  const fundings = normalizeFundings(data.fundings);
  const total = fundings.reduce((s, f) => s + f.allocated_budget, 0);

  const project = await prisma.project.create({
    data: {
      title: data.title,
      category: data.category,
      allocated_budget: total,
      fundings: { create: fundings },
    },
  });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/income");
  return project;
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    category?: Category;
    fundings?: FundingInput[];
  }
) {
  // When funding lines are provided, replace them wholesale and recompute the
  // total budget. Category-only updates (e.g. drag-and-drop) skip this branch.
  if (data.fundings) {
    const fundings = normalizeFundings(data.fundings);
    const total = fundings.reduce((s, f) => s + f.allocated_budget, 0);
    await prisma.$transaction([
      prisma.projectFunding.deleteMany({ where: { project_id: id } }),
      prisma.project.update({
        where: { id },
        data: {
          title: data.title,
          category: data.category,
          allocated_budget: total,
          fundings: { create: fundings },
        },
      }),
    ]);
  } else {
    await prisma.project.update({
      where: { id },
      data: { title: data.title, category: data.category },
    });
  }
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/income");
  revalidatePath(`/projects/${id}`);
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function getDashboardStats() {
  const [projects, recentExpenses] = await Promise.all([
    prisma.project.findMany({
      include: { expenses: true },
    }),
    prisma.expense.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      include: { project: true },
    }),
  ]);

  const totalAllocated = projects.reduce(
    (sum, p) => sum + Number(p.allocated_budget),
    0
  );
  const totalDisbursed = projects.reduce(
    (sum, p) =>
      sum + p.expenses.reduce((s, e) => s + Number(e.amount), 0),
    0
  );
  const totalRemaining = totalAllocated - totalDisbursed;
  const burnRate =
    totalAllocated > 0
      ? Math.round((totalDisbursed / totalAllocated) * 100)
      : 0;

  const categoryStats = ["ACADEMIC", "PERSONNEL", "BUDGET", "GENERAL"].map(
    (cat) => {
      const catProjects = projects.filter((p) => p.category === cat);
      const allocated = catProjects.reduce(
        (sum, p) => sum + Number(p.allocated_budget),
        0
      );
      const disbursed = catProjects.reduce(
        (sum, p) =>
          sum + p.expenses.reduce((s, e) => s + Number(e.amount), 0),
        0
      );
      return { category: cat, allocated, disbursed };
    }
  );

  return {
    totalAllocated,
    totalDisbursed,
    totalRemaining,
    burnRate,
    categoryStats,
    recentExpenses,
    projectCount: projects.length,
  };
}
