const pool = require("../config/db");
const bcrypt = require("bcryptjs");

/*
 API 8: Create User (tenant_admin only)
 POST /api/tenants/:tenantId/users
*/
exports.createUser = async (req, res, next) => {
  try {
    const { userId, tenantId, role } = req.user;

    if (role !== "tenant_admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (tenantId !== req.params.tenantId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { email, password, fullName, role: newRole = "user" } = req.body;

    const tenantResult = await pool.query(
      `SELECT max_users FROM tenants WHERE id = $1`,
      [tenantId]
    );
    if (tenantResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }
    const maxUsers = tenantResult.rows[0].max_users;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
      [tenantId]
    );
    if (parseInt(countResult.rows[0].count) >= maxUsers) {
      return res.status(403).json({ success: false, message: "Subscription user limit reached" });
    }

    const emailCheck = await pool.query(
      `SELECT id FROM users WHERE email = $1 AND tenant_id = $2`,
      [email, tenantId]
    );
    if (emailCheck.rowCount > 0) {
      return res.status(409).json({ success: false, message: "Email already exists in this tenant" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, tenant_id, is_active, created_at`,
      [email, passwordHash, fullName, newRole, tenantId]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, tenant_id, created_at)
       VALUES ($1, 'CREATE_USER', 'user', $2, $3, NOW())`,
      [userId, userResult.rows[0].id, tenantId]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        fullName: userResult.rows[0].full_name,
        role: userResult.rows[0].role,
        tenantId: userResult.rows[0].tenant_id,
        isActive: userResult.rows[0].is_active,
        createdAt: userResult.rows[0].created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

/*
 API 9: List Tenant Users
 GET /api/tenants/:tenantId/users
*/
exports.listUsers = async (req, res, next) => {
  try {
    const { tenantId: tokenTenantId } = req.user;
    const { tenantId } = req.params;

    if (tokenTenantId !== tenantId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { search, role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let filters = [`tenant_id = $1`];
    let values = [tenantId];
    let idx = 2;

    if (search) {
      filters.push(`(email ILIKE $${idx} OR full_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (role) {
      filters.push(`role = $${idx}`);
      values.push(role);
      idx++;
    }

    const whereClause = filters.join(" AND ");

    const usersResult = await pool.query(
      `SELECT id, email, full_name, role, is_active, created_at
       FROM users
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );

    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
      values
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersResult.rows.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          isActive: u.is_active,
          createdAt: u.created_at
        })),
        total: parseInt(totalResult.rows[0].count),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalResult.rows[0].count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/*
 API 10: Update User
 PUT /api/users/:userId
*/
exports.updateUser = async (req, res, next) => {
  try {
    const { userId: actorId, tenantId, role } = req.user;
    const { userId } = req.params;

    const userResult = await pool.query(
      `SELECT id, tenant_id FROM users WHERE id = $1`,
      [userId]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (userResult.rows[0].tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (req.body.fullName) {
      updates.push(`full_name = $${idx++}`);
      values.push(req.body.fullName);
    }

    if (role === "tenant_admin") {
      if (req.body.role) {
        updates.push(`role = $${idx++}`);
        values.push(req.body.role);
      }
      if (typeof req.body.isActive === "boolean") {
        updates.push(`is_active = $${idx++}`);
        values.push(req.body.isActive);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields" });
    }

    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx}`,
      [...values, userId]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, tenant_id, created_at)
       VALUES ($1, 'UPDATE_USER', 'user', $2, $3, NOW())`,
      [actorId, userId, tenantId]
    );

    res.status(200).json({ success: true, message: "User updated successfully" });
  } catch (err) {
    next(err);
  }
};

/*
 API 11: Delete User
 DELETE /api/users/:userId
*/
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId: actorId, tenantId, role } = req.user;
    const { userId } = req.params;

    if (role !== "tenant_admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (actorId === userId) {
      return res.status(403).json({ success: false, message: "Cannot delete self" });
    }

    const userResult = await pool.query(
      `SELECT tenant_id FROM users WHERE id = $1`,
      [userId]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (userResult.rows[0].tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, tenant_id, created_at)
       VALUES ($1, 'DELETE_USER', 'user', $2, $3, NOW())`,
      [actorId, userId, tenantId]
    );

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};
