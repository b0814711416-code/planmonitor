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
import { CATEGORIES } from "@/lib/constants";
import { FundingFields, rowsToFundings, type FundingRow } from "@/components/funding-fields";
import { createProject } from "@/app/actions/projects";
import { Plus } from "lucide-react";

const emptyFundings: FundingRow[] = [{ source: "", amount: "" }];

export function ProjectForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ title: "", category: "" });
  const [fundings, setFundings] = useState<FundingRow[]>(emptyFundings);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = rowsToFundings(fundings);
    if (!form.title || !form.category) return;
    if (payload.length === 0) {
      toast.error("กรุณาเลือกแหล่งเงินอย่างน้อย 1 แหล่ง");
      return;
    }

    startTransition(async () => {
      try {
        await createProject({
          title: form.title,
          category: form.category as "ACADEMIC" | "PERSONNEL" | "BUDGET" | "GENERAL",
          fundings: payload,
        });
        toast.success("เพิ่มโครงการสำเร็จ");
        setForm({ title: "", category: "" });
        setFundings(emptyFundings);
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

            <FundingFields value={fundings} onChange={setFundings} />

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
