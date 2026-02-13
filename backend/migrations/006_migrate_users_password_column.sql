-- Fix existing installations where `users.password` existed instead of `users.password_hash`
DO $$
BEGIN
    -- If `password_hash` column doesn't exist but `password` does, rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='password'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='password_hash'
    ) THEN
        ALTER TABLE "users" RENAME COLUMN "password" TO "password_hash";
    END IF;

    -- Ensure is_active column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='is_active'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "is_active" BOOLEAN DEFAULT true;
    END IF;

    -- Ensure composite unique index exists
    CREATE UNIQUE INDEX IF NOT EXISTS "users_email_tenantId_unique" ON "users" ("email", "tenantId");
END $$;
