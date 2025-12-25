const pool = require('../config/db');

/* =========================
   API 5: Get Tenant Details
========================= */
exports.getTenantById = async (req, res, next) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;

  if (role !== 'super_admin' && tenantId !== userTenantId) {
    return res.status(403).json({ success: false, message: 'Unauthorized access' });
  }

  try {
    const tenantResult = await pool.query(
      `SELECT * FROM tenants WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const stats = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) AS total_users,
        (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) AS total_projects,
        (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) AS total_tasks
      `,
      [tenantId]
    );

    const t = tenantResult.rows[0];
    const s = stats.rows[0];

    res.json({
      success: true,
      data: {
        id: t.id,
        name: t.name,
        subdomain: t.subdomain,
        status: t.status,
        subscriptionPlan: t.subscription_plan,
        maxUsers: t.max_users,
        maxProjects: t.max_projects,
        createdAt: t.created_at,
        stats: {
          totalUsers: Number(s.total_users),
          totalProjects: Number(s.total_projects),
          totalTasks: Number(s.total_tasks),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   API 6: Update Tenant
========================= */
exports.updateTenant = async (req, res, next) => {
  const { tenantId } = req.params;
  const { role } = req.user;
  const updates = req.body;

  if (role === 'tenant_admin') {
    const allowed = ['name'];
    const invalid = Object.keys(updates).filter(k => !allowed.includes(k));
    if (invalid.length > 0) {
      return res.status(403).json({ success: false, message: 'Forbidden fields' });
    }
  }

  try {
    const fieldMap = {
      name: 'name',
      status: 'status',
      subscriptionPlan: 'subscription_plan',
      maxUsers: 'max_users',
      maxProjects: 'max_projects'
    };

    const fields = [];
    const values = [];
    let index = 1;

    for (const key in updates) {
      if (fieldMap[key]) {
        fields.push(`${fieldMap[key]} = $${index}`);
        values.push(updates[key]);
        index++;
      }
    }

    values.push(tenantId);

    const result = await pool.query(
      `UPDATE tenants SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${index}
       RETURNING id, name, updated_at`,
      values
    );

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};


/* =========================
   API 7: List All Tenants
========================= */
exports.listTenants = async (req, res, next) => {
  const { page = 1, limit = 10, status, subscriptionPlan } = req.query;
  const offset = (page - 1) * limit;

  try {
    let filters = [];
    let values = [];
    let idx = 1;

    if (status) {
      filters.push(`t.status = $${idx++}`);
      values.push(status);
    }
    if (subscriptionPlan) {
      filters.push(`t.subscription_plan = $${idx++}`);
      values.push(subscriptionPlan);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const tenants = await pool.query(
      `
      SELECT t.*,
        (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) AS total_users,
        (SELECT COUNT(*) FROM projects p WHERE p.tenant_id = t.id) AS total_projects
      FROM tenants t
      ${where}
      ORDER BY t.created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
      `,
      [...values, limit, offset]
    );

    const count = await pool.query(`SELECT COUNT(*) FROM tenants`);

    res.json({
      success: true,
      data: {
        tenants: tenants.rows,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count.rows[0].count / limit),
          totalTenants: Number(count.rows[0].count),
          limit: Number(limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
