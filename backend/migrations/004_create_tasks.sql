DO $$ BEGIN
    CREATE TYPE "enum_tasks_status" AS ENUM ('todo', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_tasks_priority" AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "tasks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "enum_tasks_status" DEFAULT 'todo',
    "priority" "enum_tasks_priority" DEFAULT 'medium',
    "projectId" UUID NOT NULL REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "tenantId" UUID NOT NULL REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "assignedTo" UUID REFERENCES "users" ("id") ON DELETE SET NULL,
    "dueDate" DATE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);