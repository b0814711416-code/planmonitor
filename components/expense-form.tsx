"use client";

import { useRef, useState, useTransition } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createExpense } from "@/app/actions/expenses";
import { Paperclip, Plus, X } from "lucide-react";

interface Activity {
  id: string;
  title: string;
}

export function ExpenseForm({
  projectId,
  activities = [],
  defaultActivityId,
}: {
  projectId: string;
  activities?: Activity[];
  defaultActivityId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    disbursed_date: new Date().toISOString().slice(0, 10),
    activity_id: defaultActivityId ?? "",
  });

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...selected.filter((f) => !existing.has(f.name + f.size))];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || !form.description || !form.disbursed_date) return;

    startTransition(async () => {
      try {
        const expense = await createExpense({
          project_id: projectId,
          activity_id: form.activity_id || null,
          amount: parseFloat(form.amount),
          description: form.description,
          disbursed_date: form.disbursed_date,
        });

        if (files.length > 0) {
          const fd = new FormData();
          fd.append("expense_id", expense.id);
          fd.append("description", form.description);
          fd.append("disbursed_date", form.disbursed_date);
          files.forEach((f) => fd.append("files", f));

          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 55000);
          try {
            const res = await fetch("/api/drive/upload", {
              method: "POST",
              body: fd,
              signal: controller.signal,
            });
            clearTimeout(timer);
            if (!res.ok) {
              const data = await res.json();
              toast.warning(`บันทึกสำเร็จ แต่อัปโหลดไฟล์ไม่สำเร็จ: ${data.error}`);
            } else {
              toast.success(`บันทึกสำเร็จ และอัปโหลด ${files.length} ไฟล์เรียบร้อย`);
            }
          } catch (fetchErr) {
            clearTimeout(timer);
            const msg = fetchErr instanceof Error && fetchErr.name === "AbortError"
              ? "หมดเวลา กรุณาลองใหม่"
              : "เชื่อมต่อ Google Drive ไม่ได้";
            toast.warning(`บันทึกสำเร็จ แต่อัปโหลดไม่สำเร็จ: ${msg}`);
          }
        } else {
          toast.success("บันทึกรายการเบิกจ่ายสำเร็จ");
        }

        setForm({
          amount: "",
          description: "",
          disbursed_date: new Date().toISOString().slice(0, 10),
          activity_id: defaultActivityId ?? "",
        });
        setFiles([]);
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
        บันทึกการเบิกจ่าย
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>บันทึกรายการเบิกจ่าย</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {activities.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="activity">กิจกรรมย่อย</Label>
                <Select
                  value={form.activity_id}
                  onValueChange={(v) =>
                    setForm({ ...form, activity_id: v ?? "" })
                  }
                >
                  <SelectTrigger id="activity" className="w-full">
                    <SelectValue placeholder="— ไม่ระบุกิจกรรม (ระดับโครงการ) —" />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((act) => (
                      <SelectItem key={act.id} value={act.id}>
                        {act.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">รายละเอียด / รายการ</Label>
              <Textarea
                id="description"
                placeholder="ระบุรายละเอียดการเบิกจ่าย"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">วันที่เบิกจ่าย</Label>
              <Input
                id="date"
                type="date"
                value={form.disbursed_date}
                onChange={(e) =>
                  setForm({ ...form, disbursed_date: e.target.value })
                }
                required
              />
            </div>

            {/* File upload */}
            <div className="space-y-1.5">
              <Label>เอกสารแนบ (Google Drive)</Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-lg py-3 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
              >
                <Paperclip size={15} />
                เลือกไฟล์แนบ (หลายไฟล์ได้)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFiles}
              />
              {files.length > 0 && (
                <ul className="space-y-1 mt-1">
                  {files.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-1.5 text-xs text-slate-700"
                    >
                      <span className="truncate max-w-[300px]">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="ml-2 text-slate-400 hover:text-red-500 shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="bg-slate-900 hover:bg-slate-700"
              >
                {isPending
                  ? files.length > 0
                    ? "กำลังบันทึกและอัปโหลด..."
                    : "กำลังบันทึก..."
                  : "บันทึก"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
