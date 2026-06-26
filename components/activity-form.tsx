"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INCOME_SOURCES } from "@/lib/constants";
import { createActivity } from "@/app/actions/activities";
import { ListPlus } from "lucide-react";

export function ActivityForm({
  projectId,
  projectIncomeSource,
}: {
  projectId: string;
  projectIncomeSource?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: "",
    income_source: projectIncomeSource ?? "",
    allocated_budget: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.allocated_budget) return;

    startTransition(async () => {
      try {
        await createActivity({
          project_id: projectId,
          title: form.title,
          income_source: (form.income_source || null) as Parameters<typeof createActivity>[0]["income_source"],
          allocated_budget: parseFloat(form.allocated_budget),
        });
        toast.success("เพิ่มกิจกรรมย่อยสำเร็จ");
        setForm({ title: "", income_source: projectIncomeSource ?? "", allocated_budget: "" });
        setOpen(false);
      } catch {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <ListPlus size={15} />
        เพิ่มกิจกรรมย่อย
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มกิจกรรมย่อย</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="act-title">ชื่อกิจกรรมย่อย</Label>
              <Input
                id="act-title"
                placeholder="ระบุชื่อกิจกรรม"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="act-income">
                แหล่งรายรับ
                <span className="text-slate-400 font-normal ml-1">(ไม่บังคับ)</span>
              </Label>
              <Select
                value={form.income_source}
                onValueChange={(v) => setForm({ ...form, income_source: v ?? "" })}
              >
                <SelectTrigger id="act-income" className="w-full">
                  <SelectValue placeholder="เลือกแหล่งรายรับ" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCOME_SOURCES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="act-budget">งบประมาณที่จัดสรร (บาท)</Label>
              <Input
                id="act-budget"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.allocated_budget}
                onChange={(e) => setForm({ ...form, allocated_budget: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>ยกเลิก</Button>
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
