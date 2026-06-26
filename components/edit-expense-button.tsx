"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateExpense } from "@/app/actions/expenses";
import { Pencil } from "lucide-react";

interface Props {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  disbursed_date: Date;
}

export function EditExpenseButton({ id, projectId, amount, description, disbursed_date }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    amount: String(amount),
    description,
    disbursed_date: new Date(disbursed_date).toISOString().slice(0, 10),
  });

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setForm({
      amount: String(amount),
      description,
      disbursed_date: new Date(disbursed_date).toISOString().slice(0, 10),
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.description || !form.disbursed_date) return;

    startTransition(async () => {
      try {
        await updateExpense(id, projectId, {
          amount: parseFloat(form.amount),
          description: form.description,
          disbursed_date: form.disbursed_date,
        });
        toast.success("แก้ไขรายการเบิกจ่ายสำเร็จ");
        setOpen(false);
      } catch {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
      >
        <Pencil size={13} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขรายการเบิกจ่าย</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-exp-amount">จำนวนเงิน (บาท)</Label>
              <Input
                id="edit-exp-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-exp-description">รายละเอียด / รายการ</Label>
              <Textarea
                id="edit-exp-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-exp-date">วันที่เบิกจ่าย</Label>
              <Input
                id="edit-exp-date"
                type="date"
                value={form.disbursed_date}
                onChange={(e) => setForm({ ...form, disbursed_date: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" size="sm" disabled={isPending} className="bg-slate-900 hover:bg-slate-700">
                {isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
