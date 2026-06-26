"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { CATEGORIES, CATEGORY_COLORS, type CategoryKey } from "@/lib/constants";

const CATEGORY_THEME: Record<CategoryKey, { section: string; header: string; headerText: string; border: string; ring: string }> = {
  ACADEMIC:  { section: "bg-blue-50/60",   header: "bg-blue-100",   headerText: "text-blue-700",   border: "border-blue-300",   ring: "ring-blue-200" },
  PERSONNEL: { section: "bg-violet-50/60", header: "bg-violet-100", headerText: "text-violet-700", border: "border-violet-300", ring: "ring-violet-200" },
  BUDGET:    { section: "bg-amber-50/60",  header: "bg-amber-100",  headerText: "text-amber-700",  border: "border-amber-300",  ring: "ring-amber-200" },
  GENERAL:   { section: "bg-emerald-50/60",header: "bg-emerald-100",headerText: "text-emerald-700",border: "border-emerald-300",ring: "ring-emerald-200" },
};
import { BudgetProgress } from "@/components/budget-progress";
import { EditProjectButton } from "@/components/edit-project-button";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { updateProject } from "@/app/actions/projects";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { ChevronRight, GripVertical } from "lucide-react";

const CATEGORY_ORDER: CategoryKey[] = ["ACADEMIC", "PERSONNEL", "BUDGET", "GENERAL"];

interface Project {
  id: string;
  title: string;
  category: string;
  fundings: { source: string; allocated_budget: number }[];
  allocated: number;
  disbursed: number;
  remaining: number;
}

function DraggableRow({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
    data: { project },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1 }
    : undefined;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="border-slate-100 hover:bg-slate-50/80"
    >
      <TableCell className="pl-2 py-3.5 w-6">
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none"
        >
          <GripVertical size={15} />
        </button>
      </TableCell>
      <TableCell className="pl-1 py-3.5">
        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-1 text-sm font-medium text-slate-800 hover:text-slate-600 group"
        >
          {project.title}
          <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </Link>
      </TableCell>
      <TableCell className="py-3.5 text-right">
        <span className="text-sm text-slate-600">{formatCurrency(project.allocated)}</span>
      </TableCell>
      <TableCell className="py-3.5 text-right">
        <span className="text-sm text-amber-600 font-medium">{formatCurrency(project.disbursed)}</span>
      </TableCell>
      <TableCell className="py-3.5 text-right">
        <span className={`text-sm font-medium ${project.remaining < 0 ? "text-red-600" : "text-emerald-600"}`}>
          {formatCurrency(project.remaining)}
        </span>
      </TableCell>
      <TableCell className="py-3.5">
        <BudgetProgress disbursed={project.disbursed} allocated={project.allocated} showLabel />
      </TableCell>
      <TableCell className="py-3.5 pr-3">
        <div className="flex items-center justify-end gap-0.5">
          <EditProjectButton
            id={project.id}
            title={project.title}
            category={project.category}
            fundings={project.fundings}
          />
          <DeleteProjectButton id={project.id} title={project.title} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function CategoryDropZone({
  cat,
  projects,
  isOver,
}: {
  cat: CategoryKey;
  projects: Project[];
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: cat });

  const catAllocated = projects.reduce((s, p) => s + p.allocated, 0);
  const catDisbursed = projects.reduce((s, p) => s + p.disbursed, 0);
  const catPct = catAllocated > 0 ? Math.round((catDisbursed / catAllocated) * 100) : 0;

  const theme = CATEGORY_THEME[cat];

  return (
    <div>
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-t-xl ${theme.header}`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[cat]}`} />
          <h2 className={`text-sm font-semibold ${theme.headerText}`}>{CATEGORIES[cat]}</h2>
          <span className={`text-xs opacity-60 ${theme.headerText}`}>{projects.length} โครงการ</span>
        </div>
        <div className={`flex items-center gap-3 text-xs ${theme.headerText} opacity-80`}>
          <span>
            ใช้{" "}
            <span className="font-semibold">{formatCurrency(catDisbursed)}</span>
            {" / "}
            {formatCurrency(catAllocated)}
          </span>
          <span className="font-bold">{catPct}%</span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`rounded-b-xl border border-t-0 overflow-hidden transition-colors ${theme.section} ${
          isOver ? `${theme.border} ring-2 ${theme.ring}` : theme.border
        }`}
      >
        <Table>
          <TableHeader>
            <TableRow className={`border-0 ${theme.header}`}>
              <TableHead className="py-2.5 w-6" />
              <TableHead className={`text-xs font-medium pl-1 py-2.5 ${theme.headerText} opacity-70`}>ชื่อโครงการ</TableHead>
              <TableHead className={`text-xs font-medium text-right py-2.5 ${theme.headerText} opacity-70`}>งบจัดสรร</TableHead>
              <TableHead className={`text-xs font-medium text-right py-2.5 ${theme.headerText} opacity-70`}>เบิกจ่ายแล้ว</TableHead>
              <TableHead className={`text-xs font-medium text-right py-2.5 ${theme.headerText} opacity-70`}>คงเหลือ</TableHead>
              <TableHead className={`text-xs font-medium py-2.5 min-w-32 ${theme.headerText} opacity-70`}>ความก้าวหน้า</TableHead>
              <TableHead className="py-2.5 w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-300 text-xs py-6 italic">
                  ลากโครงการมาวางที่นี่
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => <DraggableRow key={p.id} project={p} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DragPreview({ project }: { project: Project }) {
  return (
    <div className="bg-white border border-slate-300 rounded-lg px-4 py-2.5 shadow-lg flex items-center gap-3 text-sm">
      <GripVertical size={14} className="text-slate-400" />
      <span className="font-medium text-slate-800">{project.title}</span>
      <span className="text-slate-400">{formatCurrency(project.allocated)}</span>
    </div>
  );
}

export function ProjectsDndBoard({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    projects: projects.filter((p) => p.category === cat),
  }));

  function handleDragStart(event: DragStartEvent) {
    setActiveProject(event.active.data.current?.project ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveProject(null);
    setOverId(null);

    if (!over) return;
    const newCategory = over.id as CategoryKey;
    const project = projects.find((p) => p.id === active.id);
    if (!project || project.category === newCategory) return;

    // optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, category: newCategory } : p))
    );

    startTransition(async () => {
      try {
        await updateProject(project.id, { category: newCategory });
        toast.success(`ย้าย "${project.title}" ไป${CATEGORIES[newCategory]}แล้ว`);
      } catch {
        // revert
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, category: project.category } : p))
        );
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {grouped.map(({ cat, projects: catProjects }) => (
          <CategoryDropZone
            key={cat}
            cat={cat}
            projects={catProjects}
            isOver={overId === cat}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject && <DragPreview project={activeProject} />}
      </DragOverlay>
    </DndContext>
  );
}
