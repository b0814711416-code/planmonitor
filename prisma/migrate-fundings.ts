/**
 * One-time data migration: move the legacy single `projects.income_source`
 * into the new `project_fundings` table (one funding line per project), then
 * drop the old column.
 *
 * Run this ONCE against a database that still has the old schema, BEFORE
 * `prisma db push` reconciles the new schema:
 *
 *     npx ts-node prisma/migrate-fundings.ts
 *     npm run db:push      # reconcile remaining schema (no-op for fundings)
 *
 * It is idempotent: re-running after the column is dropped does nothing.
 * Uses raw SQL so it does not depend on the generated client's shape.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count
       FROM information_schema.columns
      WHERE table_name = $1 AND column_name = $2`,
    table,
    column
  );
  return Number(rows[0]?.count ?? 0) > 0;
}

async function main() {
  const hasOldColumn = await columnExists("projects", "income_source");
  if (!hasOldColumn) {
    console.log("✓ projects.income_source already removed — nothing to migrate.");
    return;
  }

  // 1) Create the new table if db push hasn't run yet.
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS project_fundings (
      id               TEXT PRIMARY KEY,
      project_id       TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      source           "IncomeSource" NOT NULL,
      allocated_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
      created_at       TIMESTAMP(3) NOT NULL DEFAULT now(),
      updated_at       TIMESTAMP(3) NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS project_fundings_project_id_source_key
      ON project_fundings (project_id, source);
  `);

  // 2) Copy each project's legacy source into a funding line carrying its
  //    full allocated_budget. Skip projects with no source or already migrated.
  const result = await prisma.$executeRawUnsafe(`
    INSERT INTO project_fundings (id, project_id, source, allocated_budget, created_at, updated_at)
    SELECT gen_random_uuid()::text, p.id, p.income_source, p.allocated_budget, now(), now()
      FROM projects p
     WHERE p.income_source IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM project_fundings f
          WHERE f.project_id = p.id AND f.source = p.income_source
       );
  `);
  console.log(`✓ Created ${result} funding line(s) from legacy income_source.`);

  // 3) Drop the legacy column + its FK now that data is preserved.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE projects DROP COLUMN IF EXISTS income_source;`
  );
  console.log("✓ Dropped projects.income_source.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
