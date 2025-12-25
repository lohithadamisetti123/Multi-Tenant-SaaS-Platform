const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.createProject = async (req, res) => {
  try {
    // TEMPORARY LOGS (remove after testing)
    console.log("req.user:", req.user);

    const { name, description } = req.body;
    const { tenantId, userId } = req.user;

    if (!name) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    const projectId = uuidv4();

    const query = `
      INSERT INTO projects (id, tenant_id, name, description, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      projectId,
      tenantId,
      name,
      description || null,
      "active",
      userId // MUST pass userId here
    ];

    console.log("Values for INSERT:", values); // TEMPORARY LOG

    const { rows } = await pool.query(query, values);

    return res.status(201).json({ success: true, project: rows[0] });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.listProjects = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { status, search, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    let query = `SELECT * FROM projects WHERE tenant_id = $1`;
    const values = [tenantId];

    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      query += ` AND LOWER(name) LIKE $${values.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      data: {
        projects: rows,
        total: rows.length,
        pagination: { currentPage: page, totalPages: 1, limit }
      }
    });
  } catch (error) {
    console.error("List projects error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tenantId, userId } = req.user;
    const { name, description, status } = req.body;

    // Fetch project to verify ownership
    const { rows } = await pool.query(
      "SELECT * FROM projects WHERE id=$1 AND tenant_id=$2",
      [projectId, tenantId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = rows[0];

    if (project.created_by !== userId && req.user.role !== "tenant_admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Update fields
    const updatedQuery = `
      UPDATE projects
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const { rows: updatedRows } = await pool.query(updatedQuery, [
      name,
      description,
      status,
      projectId
    ]);

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedRows[0]
    });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE project
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tenantId, userId, role } = req.user;

    // Check project exists and belongs to tenant
    const { rows } = await pool.query(
      "SELECT * FROM projects WHERE id=$1 AND tenant_id=$2",
      [projectId, tenantId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = rows[0];

    // Only tenant_admin or creator can delete
    if (project.created_by !== userId && role !== "tenant_admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Delete project (cascade will remove tasks if FK is set)
    await pool.query("DELETE FROM projects WHERE id=$1", [projectId]);

    return res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
