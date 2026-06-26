import { notFound } from "next/navigation";
import { getProjectById } from "@/app/actions/projects";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CategoryBadge } from "@/components/category-badge";
import { BudgetProgress } from "@/components/budget-progress";
import { ExpenseForm } from "@/components/expense-form";
import { ActivityForm } from "@/components/activity-form";
import { ActivitySection } from "@/components/activity-section";
import { DeleteExpenseButton } from "@/components/delete-expense-button";
import { EditExpenseButton } from "@/components/edit-expense-button";
import { ViewExpenseDocuments } from "@/components/view-expense-documents";
import { EditProjectButton } from "@/components/edit-project-button";
import { IncomeBadge } from "@/components/income-badge";
import { BudgetMismatchAlert } from "@/components/budget-mismatch-alert";
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
import Link from "next/link";
import { ArrowLeft, Wallet, TrendingDown, PiggyBank } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) notFound();

  const allocated = Number(project.allocated_budget);

  // total disbursed = activity expenses + project-level expenses
  const activityDisbursed = project.activities.reduce((sum, act) => {
    return sum + act.expenses.reduce((s, e) => s + Number(e.amount), 0);
  }, 0);
  const projectLevelDisbursed = project.expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );
  const disbursed = activityDisbursed + projectLevelDisbursed;
  const remaining = allocated - disbursed;
  const pct = allocated > 0 ? Math.round((disbursed / allocated) * 100) : 0;

  const activitiesTotal = project.activities.reduce(
    (s, a) => s + Number(a.allocated_budget),
    0
  );

  const activityList = project.activities.map((a) => ({
    id: a.id,
    title: a.title,
  }));

  return (
    <div className="space-y-6">
      <BudgetMismatchAlert
        projectAllocated={allocated}
        activitiesTotal={activitiesTotal}
      />
      {/* Back + Title */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          กลับไปรายการโครงการ
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">
                {project.title}
              </h1>
              <EditProjectButton
                id={project.id}
                title={project.title}
                category={project.category}
                income_source={project.income_source ?? null}
                allocated_budget={allocated}
              />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <CategoryBadge category={project.category} />
              <IncomeBadge source={project.income_source ?? null} />
              <span className="text-xs text-slate-400">
                สร้างเมื่อ {formatDate(project.created_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActivityForm
              projectId={project.id}
              projectIncomeSource={project.income_source ?? null}
            />
            <ExpenseForm
              projectId={project.id}
              activities={activityList}
            />
          </div>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">งบจัดสรร</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatCurrency(allocated)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50">
                <Wallet size={18} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">เบิกจ่ายแล้ว</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatCurrency(disbursed)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-amber-50">
                <TrendingDown size={18} className="text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">งบคงเหลือ</p>
                <p
                  className={`text-xl font-semibold ${
                    remaining < 0 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(remaining)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50">
                <PiggyBank size={18} className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">
              ความก้าวหน้าการเบิกจ่ายรวม
            </p>
            <span
              className={`text-sm font-semibold ${
                pct >= 90
                  ? "text-red-600"
                  : pct >= 70
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            >
              {pct}%
            </span>
          </div>
          <BudgetProgress disbursed={disbursed} allocated={allocated} />
          <p className="text-xs text-slate-400 mt-2">
            {project.activities.length} กิจกรรมย่อย ·{" "}
            {project.activities.reduce((s, a) => s + a.expenses.length, 0) +
              project.expenses.length}{" "}
            รายการเบิกจ่าย
          </p>
        </CardContent>
      </Card>

      {/* Activities */}
      {project.activities.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            กิจกรรมย่อย
          </h2>
          <div className="space-y-3">
            {project.activities.map((act) => (
              <ActivitySection
                key={act.id}
                activity={act}
                projectId={project.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Project-level expenses (no activity) */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">
          {project.activities.length > 0
            ? "รายการเบิกจ่ายระดับโครงการ"
            : "ประวัติการเบิกจ่าย"}
        </h2>
        <div className="bg-white rounded-xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="text-xs text-slate-500 font-medium pl-6 py-3">
                  วันที่
                </TableHead>
                <TableHead className="text-xs text-slate-500 font-medium py-3">
                  รายละเอียด
                </TableHead>
                <TableHead className="text-xs text-slate-500 font-medium text-right py-3 pr-6">
                  จำนวนเงิน
                </TableHead>
                <TableHead className="py-3 w-8" />
                <TableHead className="py-3 w-8" />
                <TableHead className="py-3 w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.expenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-slate-400 text-sm py-10"
                  >
                    {project.activities.length > 0
                      ? "ไม่มีรายการระดับโครงการ"
                      : "ยังไม่มีรายการเบิกจ่าย"}
                  </TableCell>
                </TableRow>
              ) : (
                project.expenses.map((exp) => (
                  <TableRow key={exp.id} className="border-slate-100">
                    <TableCell className="pl-6 py-3">
                      <span className="text-sm text-slate-600">
                        {formatDate(exp.disbursed_date)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-sm text-slate-800">
                        {exp.description}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-6">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(exp.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <ViewExpenseDocuments
                        attachments={exp.attachments}
                        description={exp.description}
                      />
                    </TableCell>
                    <TableCell className="py-3">
                      <EditExpenseButton
                        id={exp.id}
                        projectId={project.id}
                        amount={Number(exp.amount)}
                        description={exp.description}
                        disbursed_date={exp.disbursed_date}
                      />
                    </TableCell>
                    <TableCell className="py-3 pr-3">
                      <DeleteExpenseButton
                        id={exp.id}
                        projectId={project.id}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
