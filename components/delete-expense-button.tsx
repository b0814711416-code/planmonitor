"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "@/app/actions/expenses";
import { X } from "lucide-react";

export function DeleteExpenseButton({
  id,
  projectId,
}: {
  id: string;
  projectId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("ยืนยันการลบรายการเบิกจ่ายนี้?")) return;
    startTransition(async () => {
      try {
        await deleteExpense(id, projectId);
        toast.success("ลบรายการสำเร็จ");
      } catch {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
      className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
    >
      <X size={13} />
    </Button>
  );
}
