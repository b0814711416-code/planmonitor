"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteDriveFolder } from "@/lib/google-drive";

export async function createExpense(data: {
  project_id: string;
  activity_id?: string | null;
  amount: number;
  description: string;
  disbursed_date: string;
}) {
  const expense = await prisma.expense.create({
    data: {
      project_id: data.project_id,
      activity_id: data.activity_id || null,
      amount: data.amount,
      description: data.description,
      disbursed_date: new Date(data.disbursed_date),
    },
  });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${data.project_id}`);
  return expense;
}

export async function updateExpense(
  id: string,
  projectId: string,
  data: {
    amount: number;
    description: string;
    disbursed_date: string;
  }
) {
  await prisma.expense.update({
    where: { id },
    data: {
      amount: data.amount,
      description: data.description,
      disbursed_date: new Date(data.disbursed_date),
    },
  });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteExpense(id: string, projectId: string) {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { attachments: { select: { drive_folder_id: true } } },
  });

  if (expense?.attachments.length) {
    const folderIds = [...new Set(expense.attachments.map((a) => a.drive_folder_id))];
    for (const folderId of folderIds) {
      try {
        await deleteDriveFolder(folderId);
      } catch (err) {
        console.error("[deleteExpense] Drive folder delete failed:", folderId, err);
      }
    }
  }

  await prisma.expense.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}
