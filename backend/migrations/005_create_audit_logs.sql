CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "action" VARCHAR(255) NOT NULL,
    "entity_type" VARCHAR(255) NOT NULL,
    "entity_id" VARCHAR(255),
    "details" JSONB,
    "ip_address" VARCHAR(255),
    "tenant_id" UUID REFERENCES "tenants" ("id") ON DELETE SET NULL,
    "user_id" UUID REFERENCES "users" ("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);