"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { IncomeSource } from "@prisma/client";

export async function createActivity(data: {
  project_id: string;
  title: string;
  income_source?: IncomeSource | null;
  allocated_budget: number;
}) {
  const activity = await prisma.activity.create({
    data: {
      project_id: data.project_id,
      title: data.title,
      income_source: data.income_source ?? null,
      allocated_budget: data.allocated_budget,
    },
  });
  revalidatePath(`/projects/${data.project_id}`);
  return activity;
}

export async function updateActivity(
  id: string,
  projectId: string,
  data: {
    title: string;
    income_source?: IncomeSource | null;
    allocated_budget: number;
  }
) {
  await prisma.activity.update({
    where: { id },
    data: {
      title: data.title,
      income_source: data.income_source ?? null,
      allocated_budget: data.allocated_budget,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteActivity(id: string, projectId: string) {
  await prisma.activity.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}
