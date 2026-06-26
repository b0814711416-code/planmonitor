import { CATEGORIES, CATEGORY_BADGE_COLORS, type CategoryKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryBadge({ category }: { category: string }) {
  const key = category as CategoryKey;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        CATEGORY_BADGE_COLORS[key] ?? "bg-slate-50 text-slate-700 border-slate-200"
      )}
    >
      {CATEGORIES[key] ?? category}
    </span>
  );
}
