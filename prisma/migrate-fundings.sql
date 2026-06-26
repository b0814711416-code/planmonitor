-- One-time migration: move legacy projects.income_source into project_fundings.
-- Safe to run more than once (idempotent). Paste into the Neon SQL Editor
-- (or any psql connected to the production database).

BEGIN;

-- 1) New table
CREATE TABLE IF NOT EXISTS project_fundings (
  id               TEXT PRIMARY KEY,
  project_id       TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source           "IncomeSource" NOT NULL,
  allocated_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at       TIMESTAMP(3) NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS project_fundings_project_id_source_key
  ON project_fundings (project_id, source);

-- 2) Copy each project's legacy single source into a funding line carrying
--    its full allocated_budget. Skips projects with no source / already done.
INSERT INTO project_fundings (id, project_id, source, allocated_budget, created_at, updated_at)
SELECT gen_random_uuid()::text, p.id, p.income_source, p.allocated_budget, now(), now()
  FROM projects p
 WHERE p.income_source IS NOT NULL
   AND NOT EXISTS (
     SELECT 1 FROM project_fundings f
      WHERE f.project_id = p.id AND f.source = p.income_source
   );

-- 3) Drop the legacy column now that data is preserved.
ALTER TABLE projects DROP COLUMN IF EXISTS income_source;

COMMIT;
