import { PrismaClient, Category, IncomeSource } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  await prisma.expense.deleteMany();
  await prisma.project.deleteMany(); // cascades to project_fundings

  const projects: {
    title: string;
    category: Category;
    fundings: { source: IncomeSource; allocated_budget: number }[];
  }[] = [
    {
      title: "พัฒนาหลักสูตรสถานศึกษา",
      category: "ACADEMIC",
      // example of a project drawing from two income sources
      fundings: [
        { source: "ACTIVITY_FEE", allocated_budget: 30000 },
        { source: "SCHOOL_REVENUE", allocated_budget: 20000 },
      ],
    },
    {
      title: "ส่งเสริมการอ่านและการเขียน",
      category: "ACADEMIC",
      fundings: [{ source: "DEVELOPMENT_FEE", allocated_budget: 30000 }],
    },
    {
      title: "จัดซื้อสื่อการเรียนการสอน",
      category: "ACADEMIC",
      fundings: [
        { source: "TEXTBOOK_FEE", allocated_budget: 25000 },
        { source: "SUPPLIES_FEE", allocated_budget: 20000 },
      ],
    },
    {
      title: "พัฒนาครูและบุคลากร",
      category: "PERSONNEL",
      fundings: [{ source: "SCHOOL_REVENUE", allocated_budget: 60000 }],
    },
    {
      title: "ส่งเสริมขวัญกำลังใจบุคลากร",
      category: "PERSONNEL",
      fundings: [{ source: "SCHOOL_REVENUE", allocated_budget: 20000 }],
    },
    {
      title: "วางแผนงบประมาณโรงเรียน",
      category: "BUDGET",
      fundings: [{ source: "SCHOOL_REVENUE", allocated_budget: 15000 }],
    },
    {
      title: "ตรวจสอบและติดตามงบประมาณ",
      category: "BUDGET",
      fundings: [{ source: "SCHOOL_REVENUE", allocated_budget: 10000 }],
    },
    {
      title: "ซ่อมบำรุงอาคารสถานที่",
      category: "GENERAL",
      fundings: [
        { source: "PROJECT_SUBSIDY", allocated_budget: 50000 },
        { source: "SCHOOL_REVENUE", allocated_budget: 30000 },
      ],
    },
    {
      title: "จัดกิจกรรมวันสำคัญ",
      category: "GENERAL",
      fundings: [{ source: "ACTIVITY_FEE", allocated_budget: 35000 }],
    },
    {
      title: "บริหารจัดการสาธารณูปโภค",
      category: "GENERAL",
      fundings: [{ source: "SCHOOL_REVENUE", allocated_budget: 40000 }],
    },
  ];

  for (const proj of projects) {
    const budget = proj.fundings.reduce((s, f) => s + f.allocated_budget, 0);
    const project = await prisma.project.create({
      data: {
        title: proj.title,
        category: proj.category,
        allocated_budget: budget,
        fundings: { create: proj.fundings },
      },
    });

    const expenseCount = Math.floor(Math.random() * 3) + 1;
    const usageRatio = 0.3 + Math.random() * 0.5;
    const totalExpense = budget * usageRatio;

    for (let i = 0; i < expenseCount; i++) {
      const amount = totalExpense / expenseCount;
      const daysAgo = Math.floor(Math.random() * 90) + 1;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      await prisma.expense.create({
        data: {
          project_id: project.id,
          amount: Math.round(amount * 100) / 100,
          description: `ค่าใช้จ่าย${i + 1} - ${proj.title}`,
          disbursed_date: date,
        },
      });
    }
  }

  console.log("Seed data created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
