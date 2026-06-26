export const dynamic = "force-dynamic";

import { getIncomeStats } from "@/app/actions/income";
import { formatCurrency } from "@/lib/utils";
import {
  INCOME_SOURCES,
  INCOME_SOURCE_COLORS,
  INCOME_SOURCE_CARD,
  INCOME_SOURCE_TRACK,
  INCOME_SOURCE_ITEM_BG,
  CATEGORIES,
  CATEGORY_BADGE_COLORS,
  type IncomeSourceKey,
  type CategoryKey,
} from "@/lib/constants";

const CATEGORY_ORDER: CategoryKey[] = ["ACADEMIC", "PERSONNEL", "BUDGET", "GENERAL"];
import { IncomeEstimateForm } from "@/components/income-estimate-form";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, TrendingDown, PiggyBank, LayoutList, FolderOpen, Layers } from "lucide-react";
import Link from "next/link";

export default async function IncomePage() {
  const stats = await getIncomeStats();

  const totalEstimated = stats.reduce((s, r) => s + r.estimated, 0);
  const totalAllocated = stats.reduce((s, r) => s + r.allocated, 0);
  const totalDisbursed = stats.reduce((s, r) => s + r.disbursed, 0);
  const totalRemaining = totalEstimated - totalAllocated;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">ประมาณการรายรับ</h1>
        <p className="text-sm text-slate-500 mt-1">ปีงบประมาณ 2569 — จัดการและติดตามรายรับตามหมวดหมู่</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "รายรับประมาณการรวม", value: formatCurrency(totalEstimated), icon: Banknote, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "จัดสรรให้โครงการแล้ว", value: formatCurrency(totalAllocated), icon: LayoutList, bg: "bg-violet-50", color: "text-violet-600" },
          { label: "เบิกจ่ายไปแล้ว", value: formatCurrency(totalDisbursed), icon: TrendingDown, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "รายรับคงเหลือ (ยังไม่จัดสรร)", value: formatCurrency(totalRemaining), icon: PiggyBank, bg: "bg-emerald-50", color: totalRemaining < 0 ? "text-red-600" : "text-emerald-600" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                  <p className={`text-xl font-semibold ${kpi.color}`}>{kpi.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon size={18} className={kpi.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Income source cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">รายละเอียดตามหมวดรายรับ</h2>
        <div className="space-y-2">
          {stats.map((row) => {
            const key = row.source as IncomeSourceKey;
            const pct = row.estimated > 0 ? Math.min(Math.round((row.allocated / row.estimated) * 100), 100) : 0;
            const overAllocated = row.allocated > row.estimated && row.estimated > 0;

            return (
              <div
                key={row.source}
                className={`rounded-xl border border-l-4 p-5 ${INCOME_SOURCE_CARD[key]}`}
              >
                <div className="flex items-start gap-4">
                  {/* Color dot + label */}
                  <div className="flex items-center gap-2 w-56 shrink-0 pt-0.5">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${INCOME_SOURCE_COLORS[key]}`} />
                    <span className="text-sm font-medium text-slate-800">{INCOME_SOURCES[key]}</span>
                  </div>

                  {/* Numbers */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        จัดสรรแล้ว{" "}
                        <span className={`font-semibold ${overAllocated ? "text-red-600" : "text-slate-700"}`}>
                          {formatCurrency(row.allocated)}
                        </span>
                        {" / "}เบิกจ่าย{" "}
                        <span className="font-semibold text-amber-600">{formatCurrency(row.disbursed)}</span>
                      </span>
                      <span className={`font-semibold ${overAllocated ? "text-red-600" : "text-emerald-600"}`}>
                        คงเหลือ {formatCurrency(row.remaining)}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${INCOME_SOURCE_TRACK[key]}`}>
                      <div
                        className={`h-full rounded-full transition-all ${overAllocated ? "bg-red-500" : INCOME_SOURCE_COLORS[key]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">{pct}% ของประมาณการ</p>
                  </div>

                  {/* Edit estimated amount */}
                  <div className="shrink-0">
                    <IncomeEstimateForm source={row.source} currentAmount={row.estimated} />
                  </div>
                </div>

                {/* Linked projects / activities grouped by category */}
                {row.items.length > 0 && (
                  <div className="mt-3 ml-[272px] space-y-3">
                    {CATEGORY_ORDER.filter((cat) =>
                      row.items.some((item) => item.category === cat)
                    ).map((cat) => {
                      const catItems = row.items
                        .filter((item) => item.category === cat)
                        .sort((a, b) => a.title.localeCompare(b.title, "th"));
                      return (
                        <div key={cat}>
                          <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border mb-1 ${CATEGORY_BADGE_COLORS[cat as CategoryKey]}`}>
                            {CATEGORIES[cat as CategoryKey]}
                          </div>
                          <div className="space-y-1">
                            {catItems.map((item) => (
                              <div
                                key={item.id}
                                className={`flex items-center justify-between text-xs text-slate-500 rounded-lg px-3 py-1.5 ${INCOME_SOURCE_ITEM_BG[key]}`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {item.type === "project" ? (
                                    <FolderOpen size={12} className="text-slate-400 shrink-0" />
                                  ) : (
                                    <Layers size={12} className="text-slate-400 shrink-0" />
                                  )}
                                  <span className="truncate">
                                    {item.type === "activity" && item.parentTitle && (
                                      <span className="text-slate-400">{item.parentTitle} · </span>
                                    )}
                                    <Link
                                      href={`/projects/${item.type === "project" ? item.id : (item.parentId ?? "")}`}
                                      className="text-slate-700 hover:text-slate-900 hover:underline"
                                    >
                                      {item.title}
                                    </Link>
                                  </span>
                                </div>
                                <span className="font-medium text-slate-700 ml-4 shrink-0">
                                  {formatCurrency(item.allocated_budget)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
