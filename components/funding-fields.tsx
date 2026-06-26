"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INCOME_SOURCES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Plus, X } from "lucide-react";

export type FundingRow = { source: string; amount: string };

const SOURCE_KEYS = Object.keys(INCOME_SOURCES) as (keyof typeof INCOME_SOURCES)[];

export function FundingFields({
  value,
  onChange,
}: {
  value: FundingRow[];
  onChange: (rows: FundingRow[]) => void;
}) {
  const rows = value.length > 0 ? value : [{ source: "", amount: "" }];

  function update(index: number, patch: Partial<FundingRow>) {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    onChange([...rows, { source: "", amount: "" }]);
  }

  function removeRow(index: number) {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [{ source: "", amount: "" }]);
  }

  const total = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>แหล่งเงินและงบประมาณ</Label>
        <span className="text-xs text-slate-400 font-normal">
          งบรวม{" "}
          <span className="font-semibold text-slate-700">{formatCurrency(total)}</span>
        </span>
      </div>

      <div className="space-y-2">
        {rows.map((row, i) => {
          const picked = new Set(
            rows.filter((_, j) => j !== i).map((r) => r.source).filter(Boolean)
          );
          return (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <Select
                  value={row.source}
                  onValueChange={(v) => update(i, { source: v ?? "" })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกแหล่งเงิน" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_KEYS.map((key) => (
                      <SelectItem
                        key={key}
                        value={key}
                        disabled={picked.has(key)}
                      >
                        {INCOME_SOURCES[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={row.amount}
                onChange={(e) => update(i, { amount: e.target.value })}
                className="w-32"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
                className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 shrink-0"
              >
                <X size={15} />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="gap-1.5 w-full border-dashed"
      >
        <Plus size={14} />
        เพิ่มแหล่งเงิน
      </Button>
    </div>
  );
}

// Convert UI rows into the action payload, dropping empty/invalid lines.
export function rowsToFundings(rows: FundingRow[]) {
  return rows
    .filter((r) => r.source && parseFloat(r.amount) > 0)
    .map((r) => ({
      source: r.source as keyof typeof INCOME_SOURCES,
      allocated_budget: parseFloat(r.amount),
    }));
}
