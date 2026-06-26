import { PrismaClient, Category } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  await prisma.expense.deleteMany();
  await prisma.project.deleteMany();

  const projects = [
    {
      title: "พัฒนาหลักสูตรสถานศึกษา",
      category: "ACADEMIC" as Category,
      allocated_budget: 50000,
    },
    {
      title: "ส่งเสริมการอ่านและการเขียน",
      category: "ACADEMIC" as Category,
      allocated_budget: 30000,
    },
    {
      title: "จัดซื้อสื่อการเรียนการสอน",
      category: "ACADEMIC" as Category,
      allocated_budget: 45000,
    },
    {
      title: "พัฒนาครูและบุคลากร",
      category: "PERSONNEL" as Category,
      allocated_budget: 60000,
    },
    {
      title: "ส่งเสริมขวัญกำลังใจบุคลากร",
      category: "PERSONNEL" as Category,
      allocated_budget: 20000,
    },
    {
      title: "วางแผนงบประมาณโรงเรียน",
      category: "BUDGET" as Category,
      allocated_budget: 15000,
    },
    {
      title: "ตรวจสอบและติดตามงบประมาณ",
      category: "BUDGET" as Category,
      allocated_budget: 10000,
    },
    {
      title: "ซ่อมบำรุงอาคารสถานที่",
      category: "GENERAL" as Category,
      allocated_budget: 80000,
    },
    {
      title: "จัดกิจกรรมวันสำคัญ",
      category: "GENERAL" as Category,
      allocated_budget: 35000,
    },
    {
      title: "บริหารจัดการสาธารณูปโภค",
      category: "GENERAL" as Category,
      allocated_budget: 40000,
    },
  ];

  for (const proj of projects) {
    const project = await prisma.project.create({ data: proj });

    const expenseCount = Math.floor(Math.random() * 3) + 1;
    const budget = proj.allocated_budget;
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
