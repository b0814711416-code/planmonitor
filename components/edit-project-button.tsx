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
import { updateProject } from "@/app/actions/projects";
import { Pencil } from "lucide-react";

interface Props {
  id: string;
  title: string;
  category: string;
  fundings: { source: string; allocated_budget: number }[];
}

function toRows(fundings: Props["fundings"]): FundingRow[] {
  if (fundings.length === 0) return [{ source: "", amount: "" }];
  return fundings.map((f) => ({ source: f.source, amount: String(f.allocated_budget) }));
}

export function EditProjectButton({ id, title, category, fundings }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ title, category });
  const [rows, setRows] = useState<FundingRow[]>(toRows(fundings));

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setForm({ title, category });
    setRows(toRows(fundings));
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = rowsToFundings(rows);
    if (!form.title || !form.category) return;
    if (payload.length === 0) {
      toast.error("กรุณาเลือกแหล่งเงินอย่างน้อย 1 แหล่ง");
      return;
    }

    startTransition(async () => {
      try {
        await updateProject(id, {
          title: form.title,
          category: form.category as "ACADEMIC" | "PERSONNEL" | "BUDGET" | "GENERAL",
          fundings: payload,
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

            <FundingFields value={rows} onChange={setRows} />

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
