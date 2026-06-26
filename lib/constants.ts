export const INCOME_SOURCES = {
  ACTIVITY_FEE:    "ค่ากิจกรรมการเรียนการสอน",
  UNIFORM_FEE:     "ค่าเครื่องแบบ",
  TEXTBOOK_FEE:    "ค่าหนังสือเรียน",
  SUPPLIES_FEE:    "ค่าอุปกรณ์การเรียน",
  DEVELOPMENT_FEE: "ค่ากิจกรรมพัฒนาผู้เรียน",
  LUNCH_SUBSIDY:   "ค่าอาหารกลางวัน อบต.",
  PROJECT_SUBSIDY: "เงินโครงการ อบต.",
  SCHOOL_REVENUE:  "เงินรายได้สถานศึกษา",
} as const;

export type IncomeSourceKey = keyof typeof INCOME_SOURCES;

export const INCOME_SOURCE_COLORS: Record<IncomeSourceKey, string> = {
  ACTIVITY_FEE:    "bg-sky-500",
  UNIFORM_FEE:     "bg-pink-500",
  TEXTBOOK_FEE:    "bg-orange-500",
  SUPPLIES_FEE:    "bg-teal-500",
  DEVELOPMENT_FEE: "bg-indigo-500",
  LUNCH_SUBSIDY:   "bg-lime-500",
  PROJECT_SUBSIDY: "bg-rose-500",
  SCHOOL_REVENUE:  "bg-purple-500",
};

export const INCOME_SOURCE_BADGE: Record<IncomeSourceKey, string> = {
  ACTIVITY_FEE:    "bg-sky-50 text-sky-700 border-sky-200",
  UNIFORM_FEE:     "bg-pink-50 text-pink-700 border-pink-200",
  TEXTBOOK_FEE:    "bg-orange-50 text-orange-700 border-orange-200",
  SUPPLIES_FEE:    "bg-teal-50 text-teal-700 border-teal-200",
  DEVELOPMENT_FEE: "bg-indigo-50 text-indigo-700 border-indigo-200",
  LUNCH_SUBSIDY:   "bg-lime-50 text-lime-700 border-lime-200",
  PROJECT_SUBSIDY: "bg-rose-50 text-rose-700 border-rose-200",
  SCHOOL_REVENUE:  "bg-purple-50 text-purple-700 border-purple-200",
};

export const INCOME_SOURCE_ORDER: IncomeSourceKey[] = [
  "ACTIVITY_FEE", "UNIFORM_FEE", "TEXTBOOK_FEE",
  "SUPPLIES_FEE", "DEVELOPMENT_FEE", "LUNCH_SUBSIDY", "PROJECT_SUBSIDY", "SCHOOL_REVENUE",
];

export const INCOME_SOURCE_CARD: Record<IncomeSourceKey, string> = {
  ACTIVITY_FEE:    "bg-sky-50 border-sky-200 border-l-sky-400",
  UNIFORM_FEE:     "bg-pink-50 border-pink-200 border-l-pink-400",
  TEXTBOOK_FEE:    "bg-orange-50 border-orange-200 border-l-orange-400",
  SUPPLIES_FEE:    "bg-teal-50 border-teal-200 border-l-teal-400",
  DEVELOPMENT_FEE: "bg-indigo-50 border-indigo-200 border-l-indigo-400",
  LUNCH_SUBSIDY:   "bg-lime-50 border-lime-200 border-l-lime-400",
  PROJECT_SUBSIDY: "bg-rose-50 border-rose-200 border-l-rose-400",
  SCHOOL_REVENUE:  "bg-purple-50 border-purple-200 border-l-purple-400",
};

export const INCOME_SOURCE_TRACK: Record<IncomeSourceKey, string> = {
  ACTIVITY_FEE:    "bg-sky-200/50",
  UNIFORM_FEE:     "bg-pink-200/50",
  TEXTBOOK_FEE:    "bg-orange-200/50",
  SUPPLIES_FEE:    "bg-teal-200/50",
  DEVELOPMENT_FEE: "bg-indigo-200/50",
  LUNCH_SUBSIDY:   "bg-lime-200/50",
  PROJECT_SUBSIDY: "bg-rose-200/50",
  SCHOOL_REVENUE:  "bg-purple-200/50",
};

export const INCOME_SOURCE_ITEM_BG: Record<IncomeSourceKey, string> = {
  ACTIVITY_FEE:    "bg-sky-100/70",
  UNIFORM_FEE:     "bg-pink-100/70",
  TEXTBOOK_FEE:    "bg-orange-100/70",
  SUPPLIES_FEE:    "bg-teal-100/70",
  DEVELOPMENT_FEE: "bg-indigo-100/70",
  LUNCH_SUBSIDY:   "bg-lime-100/70",
  PROJECT_SUBSIDY: "bg-rose-100/70",
  SCHOOL_REVENUE:  "bg-purple-100/70",
};

export const CATEGORIES = {
  ACADEMIC: "กลุ่มงานวิชาการ",
  PERSONNEL: "กลุ่มบริหารงานบุคคล",
  BUDGET: "กลุ่มบริหารงานงบประมาณ",
  GENERAL: "กลุ่มบริหารงานทั่วไป",
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const CATEGORY_COLORS: Record<CategoryKey, string> = {
  ACADEMIC: "bg-blue-500",
  PERSONNEL: "bg-violet-500",
  BUDGET: "bg-amber-500",
  GENERAL: "bg-emerald-500",
};

export const CATEGORY_BADGE_COLORS: Record<CategoryKey, string> = {
  ACADEMIC: "bg-blue-50 text-blue-700 border-blue-200",
  PERSONNEL: "bg-violet-50 text-violet-700 border-violet-200",
  BUDGET: "bg-amber-50 text-amber-700 border-amber-200",
  GENERAL: "bg-emerald-50 text-emerald-700 border-emerald-200",
};
