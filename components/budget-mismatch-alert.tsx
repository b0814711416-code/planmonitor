"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function BudgetMismatchAlert({
  projectAllocated,
  activitiesTotal,
}: {
  projectAllocated: number;
  activitiesTotal: number;
}) {
  useEffect(() => {
    if (activitiesTotal === 0) return;
    const diff = activitiesTotal - projectAllocated;
    if (diff === 0) return;

    const formatted = new Intl.NumberFormat("th-TH").format(Math.abs(diff));
    const direction = diff > 0 ? "มากกว่า" : "น้อยกว่า";

    toast.warning(
      `งบกิจกรรมย่อยรวม ${direction}งบโครงการ ${formatted} บาท`,
      {
        description: `งบโครงการ ${new Intl.NumberFormat("th-TH").format(projectAllocated)} บาท · รวมกิจกรรมย่อย ${new Intl.NumberFormat("th-TH").format(activitiesTotal)} บาท`,
        duration: 8000,
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
