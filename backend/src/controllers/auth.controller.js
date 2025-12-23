const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

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
