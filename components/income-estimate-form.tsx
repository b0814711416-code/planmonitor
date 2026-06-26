"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertIncomeEstimate } from "@/app/actions/income";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Check, X } from "lucide-react";

export function IncomeEstimateForm({
  source,
  currentAmount,
}: {
  source: string;
  currentAmount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentAmount));
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    startTransition(async () => {
      try {
        await upsertIncomeEstimate(source as Parameters<typeof upsertIncomeEstimate>[0], num);
        toast.success("บันทึกประมาณการสำเร็จ");
        setEditing(false);
      } catch {
        toast.error("เกิดข้อผิดพลาด");
      }
    });
  }

  function handleCancel() {
    setValue(String(currentAmount));
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-slate-900 min-w-28 text-right">
          {currentAmount > 0 ? formatCurrency(currentAmount) : (
            <span className="text-slate-400 font-normal text-xs">ยังไม่กำหนด</span>
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setValue(String(currentAmount)); setEditing(true); }}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
        >
          <Pencil size={13} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-7 w-32 text-sm text-right"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") handleCancel();
        }}
      />
      <Button
        size="sm"
        disabled={isPending}
        onClick={handleSave}
        className="h-7 w-7 p-0 bg-slate-900 hover:bg-slate-700"
      >
        <Check size={13} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        className="h-7 w-7 p-0 text-slate-400"
      >
        <X size={13} />
      </Button>
    </div>
  );
}
