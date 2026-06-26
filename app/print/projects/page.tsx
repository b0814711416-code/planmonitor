export const dynamic = "force-dynamic";

import { getProjects } from "@/app/actions/projects";
import { formatCurrency } from "@/lib/utils";
import { PrintButton } from "./print-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: "กลุ่มงานวิชาการ",
  PERSONNEL: "กลุ่มบริหารงานบุคคล",
  BUDGET: "กลุ่มบริหารงานงบประมาณ",
  GENERAL: "กลุ่มบริหารงานทั่วไป",
};

const CATEGORY_ORDER = ["ACADEMIC", "PERSONNEL", "BUDGET", "GENERAL"];

const INCOME_LABELS: Record<string, string> = {
  ACTIVITY_FEE: "ค่ากิจกรรมการเรียนการสอน",
  UNIFORM_FEE: "ค่าเครื่องแบบ",
  TEXTBOOK_FEE: "ค่าหนังสือเรียน",
  SUPPLIES_FEE: "ค่าอุปกรณ์การเรียน",
  DEVELOPMENT_FEE: "ค่ากิจกรรมพัฒนาผู้เรียน",
  LUNCH_SUBSIDY: "ค่าอาหารกลางวัน อบต.",
  PROJECT_SUBSIDY: "เงินโครงการ อบต.",
  SCHOOL_REVENUE: "เงินรายได้สถานศึกษา",
};

type ProjectRow = {
  type: "project";
  seq: number;
  id: string;
  title: string;
  category: string;
  sources: string[];
  allocated: number;
  disbursed: number;
  remaining: number;
  pct: string;
};

type SubtotalRow = {
  type: "subtotal";
  category: string;
  allocated: number;
  disbursed: number;
  remaining: number;
  pct: string;
};

type Row = ProjectRow | SubtotalRow;

export default async function PrintProjectsPage() {
  const projects = await getProjects();

  const projectsWithStats = projects.map((p) => {
    const disbursed = p.expenses.reduce((s, e) => s + Number(e.amount), 0);
    const allocated = Number(p.allocated_budget);
    const remaining = allocated - disbursed;
    const pct =
      allocated > 0 ? ((disbursed / allocated) * 100).toFixed(2) : "0.00";
    return {
      id: p.id,
      title: p.title,
      category: p.category as string,
      sources: p.fundings.map((f) => f.source as string),
      allocated,
      disbursed,
      remaining,
      pct,
    };
  });

  const totalAllocated = projectsWithStats.reduce(
    (s, p) => s + p.allocated,
    0
  );
  const totalDisbursed = projectsWithStats.reduce(
    (s, p) => s + p.disbursed,
    0
  );
  const totalRemaining = totalAllocated - totalDisbursed;
  const totalPct =
    totalAllocated > 0
      ? ((totalDisbursed / totalAllocated) * 100).toFixed(2)
      : "0.00";

  let seq = 0;
  const rows: Row[] = [];

  for (const cat of CATEGORY_ORDER) {
    const catProjects = projectsWithStats
      .filter((p) => p.category === cat)
      .sort((a, b) => a.title.localeCompare(b.title, "th"));
    if (catProjects.length === 0) continue;

    for (const p of catProjects) {
      seq++;
      rows.push({ type: "project", seq, ...p });
    }

    const catAllocated = catProjects.reduce((s, p) => s + p.allocated, 0);
    const catDisbursed = catProjects.reduce((s, p) => s + p.disbursed, 0);
    const catRemaining = catAllocated - catDisbursed;
    const catPct =
      catAllocated > 0
        ? ((catDisbursed / catAllocated) * 100).toFixed(2)
        : "0.00";

    rows.push({
      type: "subtotal",
      category: cat,
      allocated: catAllocated,
      disbursed: catDisbursed,
      remaining: catRemaining,
      pct: catPct,
    });
  }

  const printDate = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="print-wrapper">
      {/* Screen-only toolbar */}
      <div className="no-print screen-controls">
        <Link href="/projects" className="back-link">
          <ArrowLeft size={14} />
          กลับรายการโครงการ
        </Link>
        <PrintButton />
      </div>

      {/* Government document */}
      <div className="gov-report">
        {/* Header */}
        <div className="gov-header">
          <p className="gov-title-main">
            แบบรายงานสรุปผลการดำเนินงานตามแผนปฏิบัติการ
          </p>
          <p className="gov-school-name">โรงเรียนบ้านไชยสอ</p>
          <p className="gov-subtitle">ประจำปีงบประมาณ พ.ศ. ๒๕๖๙</p>
          <p className="gov-date">ณ วันที่ {printDate}</p>
        </div>

        {/* Report table */}
        <table className="gov-table">
          <thead>
            <tr>
              <th rowSpan={2} className="col-seq">
                ลำดับ
              </th>
              <th rowSpan={2} className="col-name">
                ชื่อโครงการ
              </th>
              <th rowSpan={2} className="col-cat">
                กลุ่มงาน
              </th>
              <th rowSpan={2} className="col-source">
                แหล่งงบประมาณ
              </th>
              <th colSpan={3}>งบประมาณ (บาท)</th>
              <th rowSpan={2} className="col-pct">
                ร้อยละ
                <br />
                การเบิกจ่าย
              </th>
              <th rowSpan={2} className="col-note">
                หมายเหตุ
              </th>
            </tr>
            <tr>
              <th className="col-money">ได้รับจัดสรร</th>
              <th className="col-money">เบิกจ่ายแล้ว</th>
              <th className="col-money">คงเหลือ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              if (row.type === "project") {
                return (
                  <tr key={row.id}>
                    <td className="cell-center">{row.seq}</td>
                    <td>{row.title}</td>
                    <td className="cell-center cell-sm">
                      {CATEGORY_LABELS[row.category] ?? row.category}
                    </td>
                    <td className="cell-center cell-sm">
                      {row.sources.length > 0
                        ? row.sources
                            .map((s) => INCOME_LABELS[s] ?? s)
                            .join(", ")
                        : "-"}
                    </td>
                    <td className="cell-right">
                      {formatCurrency(row.allocated)}
                    </td>
                    <td className="cell-right">
                      {formatCurrency(row.disbursed)}
                    </td>
                    <td className="cell-right">
                      {formatCurrency(row.remaining)}
                    </td>
                    <td className="cell-center">{row.pct}%</td>
                    <td></td>
                  </tr>
                );
              }

              return (
                <tr key={`sub-${row.category}`} className="subtotal-row">
                  <td colSpan={4} className="cell-right">
                    รวม{CATEGORY_LABELS[row.category]}
                  </td>
                  <td className="cell-right">
                    {formatCurrency(row.allocated)}
                  </td>
                  <td className="cell-right">
                    {formatCurrency(row.disbursed)}
                  </td>
                  <td className="cell-right">
                    {formatCurrency(row.remaining)}
                  </td>
                  <td className="cell-center">{row.pct}%</td>
                  <td></td>
                </tr>
              );
            })}

            {/* Grand total */}
            <tr className="total-row">
              <td colSpan={4} className="cell-right">
                รวมทั้งหมด
              </td>
              <td className="cell-right">{formatCurrency(totalAllocated)}</td>
              <td className="cell-right">{formatCurrency(totalDisbursed)}</td>
              <td className="cell-right">{formatCurrency(totalRemaining)}</td>
              <td className="cell-center">{totalPct}%</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* Signature section */}
        <div className="gov-signatures">
          <div className="sig-block">
            <p>
              ลงชื่อ .......................................................
              ผู้รายงาน
            </p>
            <p>( ....................................................... )</p>
            <p>ตำแหน่ง ......................................................</p>
            <p>
              วันที่ ......... เดือน ..................... พ.ศ. ...........
            </p>
          </div>
          <div className="sig-block">
            <p>
              ลงชื่อ .......................................................
              ผู้ตรวจสอบ
            </p>
            <p>( ....................................................... )</p>
            <p>ตำแหน่ง ......................................................</p>
            <p>
              วันที่ ......... เดือน ..................... พ.ศ. ...........
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
