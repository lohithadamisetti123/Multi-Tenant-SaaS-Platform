const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwtUtil = require('../config/jwt');

exports.registerTenant = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, 'active', 'free', 5, 5)
       RETURNING id`,
      [tenantName, subdomain]
    );

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin')
       RETURNING id, email, full_name, role`,
      [tenantResult.rows[0].id, adminEmail, passwordHash, adminFullName]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId: tenantResult.rows[0].id,
        subdomain,
        adminUser: userResult.rows[0],
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.login = async (req, res, next) => {
  const { email, password, tenantSubdomain } = req.body;

  try {
    let user;
    let tenant = null;

    // SUPER ADMIN LOGIN
    if (!tenantSubdomain) {
      const result = await pool.query(
        `SELECT * FROM users WHERE email = $1 AND role = 'super_admin'`,
        [email]
      );

      if (result.rowCount === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      user = result.rows[0];
    } else {
      // TENANT USER LOGIN
      const tenantResult = await pool.query(
        `SELECT * FROM tenants WHERE subdomain = $1`,
        [tenantSubdomain]
      );

      if (tenantResult.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
      }

      tenant = tenantResult.rows[0];

      if (tenant.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Tenant inactive' });
      }

      const userResult = await pool.query(
        `SELECT * FROM users WHERE email = $1 AND tenant_id = $2`,
        [email, tenant.id]
      );

      if (userResult.rowCount === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      user = userResult.rows[0];

      if (!user.is_active) {
        return res.status(403).json({ success: false, message: 'User inactive' });
      }
    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const tokenPayload = { userId: user.id, role: user.role };
    if (tenant) tokenPayload.tenantId = tenant.id;

    const token = jwtUtil.generateToken(tokenPayload);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: tenant ? tenant.id : null
        },
        token,
        expiresIn: 86400
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const { userId, tenantId, role } = req.user;

    let query = `
      SELECT u.id, u.email, u.full_name, u.role, u.is_active,
             t.id AS tenant_id, t.name, t.subdomain, t.subscription_plan,
             t.max_users, t.max_projects
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1
    `;

    const params = [userId];
    if (role !== 'super_admin') params.push(tenantId) && (query += ' AND t.id = $2');

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const row = result.rows[0];

    res.json({
      success: true,
      data: {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        isActive: row.is_active,
        tenant: row.tenant_id
          ? {
              id: row.tenant_id,
              name: row.name,
              subdomain: row.subdomain,
              subscriptionPlan: row.subscription_plan,
              maxUsers: row.max_users,
              maxProjects: row.max_projects,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
