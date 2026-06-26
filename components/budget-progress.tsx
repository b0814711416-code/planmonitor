import { cn } from "@/lib/utils";
import { calcBurnRate } from "@/lib/utils";

interface BudgetProgressProps {
  disbursed: number;
  allocated: number;
  showLabel?: boolean;
  className?: string;
}

export function BudgetProgress({
  disbursed,
  allocated,
  showLabel = false,
  className,
}: BudgetProgressProps) {
  const pct = calcBurnRate(disbursed, allocated);
  const color =
    pct >= 90
      ? "bg-red-500"
      : pct >= 70
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div className={cn("w-full", className)}>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 mt-0.5">{pct}% ใช้ไปแล้ว</p>
      )}
    </div>
  );
}
