"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/app/actions/projects";
import { Trash2 } from "lucide-react";

export function DeleteProjectButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`ลบโครงการ "${title}" และรายการเบิกจ่ายทั้งหมดออก?`)) return;
    startTransition(async () => {
      try {
        await deleteProject(id);
        toast.success("ลบโครงการสำเร็จ");
        router.refresh();
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
      className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
    >
      <Trash2 size={14} />
    </Button>
  );
}
