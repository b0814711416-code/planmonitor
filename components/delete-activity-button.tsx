"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteActivity } from "@/app/actions/activities";
import { Trash2 } from "lucide-react";

export function DeleteActivityButton({
  id,
  projectId,
  title,
}: {
  id: string;
  projectId: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`ลบกิจกรรมย่อย "${title}" และรายการเบิกจ่ายทั้งหมดออก?`))
      return;
    startTransition(async () => {
      try {
        await deleteActivity(id, projectId);
        toast.success("ลบกิจกรรมย่อยสำเร็จ");
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
      <Trash2 size={13} />
    </Button>
  );
}
