const { Tenant, AuditLog } = require('../models');

exports.getTenant = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin' && req.user.tenantId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    // Calculate stats
    const { User, Project, Task } = require('../models');
    console.log('Calculating stats for tenant:', req.params.id);
    const totalUsers = await User.count({ where: { tenantId: req.params.id } });
    const totalProjects = await Project.count({ where: { tenantId: req.params.id } });
    const totalTasks = await Task.count({ where: { tenantId: req.params.id } });
    const completedTasks = await Task.count({ where: { tenantId: req.params.id, status: 'done' } });
    console.log('Stats:', { totalUsers, totalProjects, totalTasks, completedTasks });

    res.json({
      success: true,
      data: {
        ...tenant.toJSON(),
        stats: {
          totalUsers,
          totalProjects,
          totalTasks,
          completedTasks
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listTenants = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // --- MANDATORY FIX: Pagination Implementation ---
    const { page = 1, limit = 10, status, subscriptionPlan } = req.query;
    const offset = (page - 1) * limit;

    // Build filter object
    const whereClause = {};
    if (status) whereClause.status = status;
    if (subscriptionPlan) whereClause.subscriptionPlan = subscriptionPlan;

    const { count, rows } = await Tenant.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        tenants: rows,
        pagination: {
          total: count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
    // ------------------------------------------------
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    if (req.user.role === 'tenant_admin') {
      if (req.user.tenantId !== req.params.id) return res.status(403).json({ success: false, message: 'Unauthorized' });
      await tenant.update({ name });
    } else if (req.user.role === 'super_admin') {
      await tenant.update({ name, status, subscriptionPlan, maxUsers, maxProjects });
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await AuditLog.create({
      action: 'UPDATE_TENANT',
      entityType: 'Tenant',
      entityId: tenant.id,
      tenantId: tenant.id,
      userId: req.user.id,
      details: req.body
    });

    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};