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
import { createProject } from "@/app/actions/projects";
import { Plus } from "lucide-react";

export function ProjectForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: "",
    category: "",
    income_source: "",
    allocated_budget: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.category || !form.allocated_budget) return;

    startTransition(async () => {
      try {
        await createProject({
          title: form.title,
          category: form.category as "ACADEMIC" | "PERSONNEL" | "BUDGET" | "GENERAL",
          income_source: form.income_source as Parameters<typeof createProject>[0]["income_source"] || null,
          allocated_budget: parseFloat(form.allocated_budget),
        });
        toast.success("เพิ่มโครงการสำเร็จ");
        setForm({ title: "", category: "", income_source: "", allocated_budget: "" });
        setOpen(false);
      } catch {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    });
  }

  return (
    <>
      <Button
        size="sm"
        className="gap-1.5 bg-slate-900 hover:bg-slate-700"
        onClick={() => setOpen(true)}
      >
        <Plus size={15} />
        เพิ่มโครงการ
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มโครงการใหม่</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">ชื่อโครงการ / กิจกรรม</Label>
              <Input
                id="title"
                placeholder="ระบุชื่อโครงการ"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">หมวดงบประมาณ</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v ?? "" })}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="เลือกหมวดงบประมาณ" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="income_source">
                แหล่งรายรับ
                <span className="text-slate-400 font-normal ml-1">(ไม่บังคับ)</span>
              </Label>
              <Select
                value={form.income_source}
                onValueChange={(v) => setForm({ ...form, income_source: v ?? "" })}
              >
                <SelectTrigger id="income_source" className="w-full">
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
              <Label htmlFor="budget">งบประมาณที่จัดสรร (บาท)</Label>
              <Input
                id="budget"
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
