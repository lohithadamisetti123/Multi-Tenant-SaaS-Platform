DO $$ BEGIN
    CREATE TYPE "enum_tasks_status" AS ENUM ('todo', 'in_progress', 'done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "tasks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "status" "enum_tasks_status" DEFAULT 'todo',
    "project_id" UUID NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "tenant_id" UUID NOT NULL REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "assigned_to" UUID REFERENCES "users" ("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);