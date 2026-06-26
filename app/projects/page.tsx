export const dynamic = "force-dynamic";

import { getProjects } from "@/app/actions/projects";
import { formatCurrency } from "@/lib/utils";
import { ProjectForm } from "@/components/project-form";
import { ProjectsDndBoard } from "@/components/projects-dnd-board";
import Link from "next/link";
import { Printer } from "lucide-react";

export default async function ProjectsPage() {
  const projects = await getProjects();

  const projectsWithStats = projects
    .map((p) => {
      const disbursed = p.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const allocated = Number(p.allocated_budget);
      const remaining = allocated - disbursed;
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        fundings: p.fundings.map((f) => ({
          source: f.source as string,
          allocated_budget: Number(f.allocated_budget),
        })),
        allocated,
        disbursed,
        remaining,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "th"));

  const totalAllocated = projectsWithStats.reduce((s, p) => s + p.allocated, 0);
  const totalDisbursed = projectsWithStats.reduce((s, p) => s + p.disbursed, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">โครงการทั้งหมด</h1>
          <p className="text-sm text-slate-500 mt-1">
            {projects.length} โครงการ · ปีงบประมาณ 2569 ·{" "}
            <span className="text-slate-700 font-medium">{formatCurrency(totalDisbursed)}</span>{" "}
            จาก {formatCurrency(totalAllocated)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/print/projects"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Printer size={15} />
            พิมพ์รายงาน
          </Link>
          <ProjectForm />
        </div>
      </div>

      {projectsWithStats.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-slate-400 text-sm">
          ยังไม่มีโครงการ กดปุ่ม &ldquo;เพิ่มโครงการ&rdquo; เพื่อเริ่มต้น
        </div>
      ) : (
        <ProjectsDndBoard initialProjects={projectsWithStats} />
      )}
    </div>
  );
}
