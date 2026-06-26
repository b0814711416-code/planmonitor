"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Category, IncomeSource } from "@prisma/client";

export async function getProjects() {
  return prisma.project.findMany({
    include: {
      expenses: true,
    },
    orderBy: { created_at: "desc" },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
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

export async function createProject(data: {
  title: string;
  category: Category;
  income_source?: IncomeSource | null;
  allocated_budget: number;
}) {
  const project = await prisma.project.create({
    data: {
      title: data.title,
      category: data.category,
      income_source: data.income_source ?? null,
      allocated_budget: data.allocated_budget,
    },
  });
  revalidatePath("/");
  revalidatePath("/projects");
  return project;
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    category?: Category;
    income_source?: IncomeSource | null;
    allocated_budget?: number;
  }
) {
  const project = await prisma.project.update({
    where: { id },
    data,
  });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return project;
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
