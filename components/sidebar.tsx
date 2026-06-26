"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, School, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHOOL_NAME } from "@/lib/constants";

const navItems = [
  { href: "/", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/projects", label: "โครงการ", icon: FolderOpen },
  { href: "/income", label: "รายรับ", icon: Banknote },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-slate-200 flex flex-col z-10">
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <School className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              {SCHOOL_NAME}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              ระบบติดตามแผนงาน
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-200">
        <p className="text-[10px] text-slate-400">
          ปีงบประมาณ 2569
        </p>
      </div>
    </aside>
  );
}
