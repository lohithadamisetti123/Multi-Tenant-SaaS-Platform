-- Ensure 'description', 'priority', and 'dueDate' columns exist on tasks
DO $$
BEGIN
    -- Create priority enum type if missing
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_tasks_priority') THEN
        CREATE TYPE "enum_tasks_priority" AS ENUM ('low', 'medium', 'high');
    END IF;

    -- Create status enum type if missing (safe no-op if exists)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_tasks_status') THEN
        CREATE TYPE "enum_tasks_status" AS ENUM ('todo', 'in_progress', 'completed');
    END IF;

    -- Add description column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='tasks' AND column_name='description'
    ) THEN
        ALTER TABLE "tasks" ADD COLUMN "description" TEXT;
    END IF;

    -- Add priority column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='tasks' AND column_name='priority'
    ) THEN
        ALTER TABLE "tasks" ADD COLUMN "priority" "enum_tasks_priority" DEFAULT 'medium';
    END IF;

    -- Add dueDate column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='tasks' AND column_name='dueDate'
    ) THEN
        ALTER TABLE "tasks" ADD COLUMN "dueDate" DATE;
    END IF;
END $$;
