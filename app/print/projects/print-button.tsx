"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-print">
      พิมพ์รายงาน
    </button>
  );
}
