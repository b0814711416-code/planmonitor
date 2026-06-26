export const dynamic = "force-dynamic";

import { getDashboardStats } from "@/app/actions/projects";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CATEGORIES, CATEGORY_COLORS, type CategoryKey } from "@/lib/constants";
import { CategoryBadge } from "@/components/category-badge";
import { BudgetProgress } from "@/components/budget-progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, TrendingDown, PiggyBank, Percent } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    {
      label: "งบประมาณรวมทั้งหมด",
      value: formatCurrency(stats.totalAllocated),
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "เบิกจ่ายไปแล้ว",
      value: formatCurrency(stats.totalDisbursed),
      icon: TrendingDown,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "งบประมาณคงเหลือ",
      value: formatCurrency(stats.totalRemaining),
      icon: PiggyBank,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "อัตราการเบิกจ่ายรวม",
      value: `${stats.burnRate}%`,
      icon: Percent,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">ภาพรวมงบประมาณ</h1>
        <p className="text-sm text-slate-500 mt-1">
          ปีงบประมาณ 2569 — โรงเรียนบ้านไชยสอ
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                  <p className="text-xl font-semibold text-slate-900">
                    {kpi.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon size={18} className={kpi.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Breakdown */}
      <Card className="border-slate-200 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            สรุปตามกลุ่มงาน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {stats.categoryStats.map((cat) => {
            const key = cat.category as CategoryKey;
            const pct =
              cat.allocated > 0
                ? Math.round((cat.disbursed / cat.allocated) * 100)
                : 0;
            const remaining = cat.allocated - cat.disbursed;
            return (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[key]}`}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {CATEGORIES[key]}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">
                      {formatCurrency(cat.disbursed)} /{" "}
                      {formatCurrency(cat.allocated)}
                    </span>
                    <span className="ml-2 text-xs font-medium text-slate-700">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${CATEGORY_COLORS[key]} opacity-80`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  คงเหลือ {formatCurrency(remaining)}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-slate-200 shadow-none">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            รายการเบิกจ่ายล่าสุด
          </CardTitle>
          <Link
            href="/projects"
            className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            ดูทั้งหมด →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="text-xs text-slate-500 font-medium pl-6">
                  โครงการ
                </TableHead>
                <TableHead className="text-xs text-slate-500 font-medium">
                  หมวดงาน
                </TableHead>
                <TableHead className="text-xs text-slate-500 font-medium">
                  รายการ
                </TableHead>
                <TableHead className="text-xs text-slate-500 font-medium text-right pr-6">
                  จำนวนเงิน
                </TableHead>
                <TableHead className="text-xs text-slate-500 font-medium pr-6">
                  วันที่
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentExpenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-slate-400 text-sm py-8"
                  >
                    ยังไม่มีรายการเบิกจ่าย
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentExpenses.map((exp) => (
                  <TableRow key={exp.id} className="border-slate-100">
                    <TableCell className="pl-6 py-3">
                      <Link
                        href={`/projects/${exp.project_id}`}
                        className="text-sm font-medium text-slate-800 hover:text-slate-600"
                      >
                        {exp.project.title}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3">
                      <CategoryBadge category={exp.project.category} />
                    </TableCell>
                    <TableCell className="py-3 max-w-xs">
                      <p className="text-sm text-slate-600 truncate">
                        {exp.description}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-6">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(exp.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 pr-6">
                      <span className="text-sm text-slate-500">
                        {formatDate(exp.disbursed_date)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
