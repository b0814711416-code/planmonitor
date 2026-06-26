"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BudgetProgress } from "@/components/budget-progress";
import { DeleteActivityButton } from "@/components/delete-activity-button";
import { DeleteExpenseButton } from "@/components/delete-expense-button";
import { EditActivityButton } from "@/components/edit-activity-button";
import { EditExpenseButton } from "@/components/edit-expense-button";
import { ViewExpenseDocuments } from "@/components/view-expense-documents";
import { ExpenseForm } from "@/components/expense-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Attachment {
  id: string;
  file_name: string;
  drive_file_id: string;
  drive_folder_id: string;
  drive_folder_name: string;
}

interface Expense {
  id: string;
  amount: unknown;
  description: string;
  disbursed_date: Date;
  attachments?: Attachment[];
}

interface Activity {
  id: string;
  title: string;
  income_source: string | null;
  allocated_budget: unknown;
  project_id: string;
  expenses: Expense[];
}

export function ActivitySection({
  activity,
  projectId,
}: {
  activity: Activity;
  projectId: string;
}) {
  const [expanded, setExpanded] = useState(true);

  const allocated = Number(String(activity.allocated_budget));
  const disbursed = activity.expenses.reduce(
    (sum, e) => sum + Number(String(e.amount)),
    0
  );
  const remaining = allocated - disbursed;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Activity header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button className="text-slate-400 shrink-0">
            {expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          <span className="text-sm font-semibold text-slate-800 truncate">
            {activity.title}
          </span>
        </div>

        <div className="flex items-center gap-4 ml-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-lg">
              งบ {formatCurrency(allocated)}
            </span>
            <span className="bg-amber-50 text-amber-700 font-medium px-2.5 py-1 rounded-lg border border-amber-200">
              ใช้ {formatCurrency(disbursed)}
            </span>
            <span
              className={`font-medium px-2.5 py-1 rounded-lg border ${
                remaining < 0
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              คงเหลือ {formatCurrency(remaining)}
            </span>
          </div>

          <div
            className="w-24"
            onClick={(e) => e.stopPropagation()}
          >
            <BudgetProgress disbursed={disbursed} allocated={allocated} />
          </div>

          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <ExpenseForm
              projectId={projectId}
              activities={[{ id: activity.id, title: activity.title }]}
              defaultActivityId={activity.id}
            />
            <EditActivityButton
              id={activity.id}
              projectId={projectId}
              title={activity.title}
              income_source={activity.income_source}
              allocated_budget={allocated}
            />
            <DeleteActivityButton
              id={activity.id}
              projectId={projectId}
              title={activity.title}
            />
          </div>
        </div>
      </div>

      {/* Expense list */}
      {expanded && (
        <div className="bg-white">
          {activity.expenses.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              ยังไม่มีรายการเบิกจ่าย
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-xs text-slate-400 font-medium pl-10 py-2">
                    วันที่
                  </TableHead>
                  <TableHead className="text-xs text-slate-400 font-medium py-2">
                    รายละเอียด
                  </TableHead>
                  <TableHead className="text-xs text-slate-400 font-medium text-right py-2 pr-10">
                    จำนวนเงิน
                  </TableHead>
                  <TableHead className="py-2 w-8" />
                  <TableHead className="py-2 w-8" />
                  <TableHead className="py-2 w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.expenses.map((exp) => (
                  <TableRow key={exp.id} className="border-slate-100">
                    <TableCell className="pl-10 py-2.5">
                      <span className="text-sm text-slate-500">
                        {formatDate(exp.disbursed_date)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className="text-sm text-slate-700">
                        {exp.description}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-right pr-10">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(exp.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <ViewExpenseDocuments
                        attachments={exp.attachments ?? []}
                        description={exp.description}
                      />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <EditExpenseButton
                        id={exp.id}
                        projectId={projectId}
                        amount={Number(String(exp.amount))}
                        description={exp.description}
                        disbursed_date={exp.disbursed_date}
                      />
                    </TableCell>
                    <TableCell className="py-2.5 pr-2">
                      <DeleteExpenseButton
                        id={exp.id}
                        projectId={projectId}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
