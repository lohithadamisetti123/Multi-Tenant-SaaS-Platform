DO $$ BEGIN
    CREATE TYPE "enum_users_status" AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "status" "enum_users_status" DEFAULT 'active',
ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP WITH TIME ZONE;

ALTER TABLE "projects"
ADD COLUMN IF NOT EXISTS "start_date" DATE,
ADD COLUMN IF NOT EXISTS "end_date" DATE,
ADD COLUMN IF NOT EXISTS "budget" DECIMAL(10, 2);
