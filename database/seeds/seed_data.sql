-- =========================
-- Super Admin (no tenant)
-- =========================
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
    'superadmin@system.com',
    '$2b$10$Mc5X.TugXjcVb4W4T5YSYuwwu1Q8KjhW/W414oewXGzdGW1CMiGSK',
    'System Super Admin',
    'super_admin'
);

-- =========================
-- Tenant
-- =========================
INSERT INTO tenants (name, subdomain, status, subscription_plan)
VALUES (
    'Demo Company',
    'demo',
    'active',
    'pro'
);

-- =========================
-- Tenant Admin
-- =========================
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
SELECT
    id,
    'admin@demo.com',
    '$2b$10$RKCAQnhkbuCS5QV3B65Dc.F5JSAs81L3eMiKDcy2bRx4sZFVUF2u.',
    'Demo Admin',
    'tenant_admin'
FROM tenants
WHERE subdomain = 'demo';

-- =========================
-- Regular Users
-- =========================
INSERT INTO users (tenant_id, email, password_hash, full_name, role)
SELECT
    id,
    'user1@demo.com',
    '$2b$10$h/IKzEUGOnpKJN2eSX2q6O6jR9ncZMi5DOmzWn6tBlIaD27tE.Rku',
    'User One',
    'user'
FROM tenants
WHERE subdomain = 'demo';

INSERT INTO users (tenant_id, email, password_hash, full_name, role)
SELECT
    id,
    'user2@demo.com',
    '$2b$10$h/IKzEUGOnpKJN2eSX2q6O6jR9ncZMi5DOmzWn6tBlIaD27tE.Rku',
    'User Two',
    'user'
FROM tenants
WHERE subdomain = 'demo';

-- =========================
-- Projects
-- =========================
INSERT INTO projects (tenant_id, name, description, status, created_by)
SELECT
    t.id,
    'Project Alpha',
    'First demo project',
    'active',
    u.id
FROM tenants t
JOIN users u ON u.email = 'admin@demo.com'
WHERE t.subdomain = 'demo';

INSERT INTO projects (tenant_id, name, description, status, created_by)
SELECT
    t.id,
    'Project Beta',
    'Second demo project',
    'active',
    u.id
FROM tenants t
JOIN users u ON u.email = 'admin@demo.com'
WHERE t.subdomain = 'demo';

-- =========================
-- Tasks
-- =========================
INSERT INTO tasks (project_id, tenant_id, title, status, priority)
SELECT
    p.id,
    t.id,
    'Setup project',
    'todo',
    'high'
FROM projects p
JOIN tenants t ON t.subdomain = 'demo'
WHERE p.name = 'Project Alpha';

INSERT INTO tasks (project_id, tenant_id, title, status, priority)
SELECT
    p.id,
    t.id,
    'Design DB',
    'in_progress',
    'medium'
FROM projects p
JOIN tenants t ON t.subdomain = 'demo'
WHERE p.name = 'Project Alpha';
