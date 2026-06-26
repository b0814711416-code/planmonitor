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
import { CATEGORIES, INCOME_SOURCES } from "@/lib/constants";
import { updateProject } from "@/app/actions/projects";
import { Pencil } from "lucide-react";

interface Props {
  id: string;
  title: string;
  category: string;
  income_source: string | null;
  allocated_budget: number;
}

export function EditProjectButton({ id, title, category, income_source, allocated_budget }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title,
    category,
    income_source: income_source ?? "",
    allocated_budget: String(allocated_budget),
  });

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setForm({ title, category, income_source: income_source ?? "", allocated_budget: String(allocated_budget) });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.category || !form.allocated_budget) return;

    startTransition(async () => {
      try {
        await updateProject(id, {
          title: form.title,
          category: form.category as "ACADEMIC" | "PERSONNEL" | "BUDGET" | "GENERAL",
          income_source: (form.income_source || null) as Parameters<typeof updateProject>[1]["income_source"],
          allocated_budget: parseFloat(form.allocated_budget),
        });
        toast.success("แก้ไขโครงการสำเร็จ");
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
        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
      >
        <Pencil size={14} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขโครงการ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">ชื่อโครงการ / กิจกรรม</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-category">หมวดงบประมาณ</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v ?? form.category })}
              >
                <SelectTrigger id="edit-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-income">
                แหล่งรายรับ
                <span className="text-slate-400 font-normal ml-1">(ไม่บังคับ)</span>
              </Label>
              <Select
                value={form.income_source}
                onValueChange={(v) => setForm({ ...form, income_source: v ?? "" })}
              >
                <SelectTrigger id="edit-income" className="w-full">
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
              <Label htmlFor="edit-budget">งบประมาณที่จัดสรร (บาท)</Label>
              <Input
                id="edit-budget"
                type="number"
                min="0"
                step="0.01"
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
