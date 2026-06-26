import { INCOME_SOURCES, INCOME_SOURCE_BADGE, type IncomeSourceKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function IncomeBadge({ source }: { source: string | null }) {
  if (!source) return null;
  const key = source as IncomeSourceKey;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        INCOME_SOURCE_BADGE[key] ?? "bg-slate-50 text-slate-700 border-slate-200"
      )}
    >
      {INCOME_SOURCES[key] ?? source}
    </span>
  );
}
