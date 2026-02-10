const bcrypt = require('bcryptjs');
const { User, Tenant, AuditLog } = require('../models');

exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Only admins can add users' });
    }

    const tenant = await Tenant.findByPk(req.user.tenantId);
    const currentUserCount = await User.count({ where: { tenantId: req.user.tenantId } });

    if (currentUserCount >= tenant.maxUsers) {
      return res.status(403).json({ 
        success: false, 
        message: `Subscription limit reached (max ${tenant.maxUsers} users)` 
      });
    }

    const { fullName, email, password, role } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Email, password, and fullName are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const userExists = await User.findOne({ where: { email, tenantId: req.user.tenantId } });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'Email already exists in this tenant' });
    }

    const salt = await require('bcryptjs').genSalt(10);
    const hashedPassword = await require('bcryptjs').hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password_hash: hashedPassword,
      role: role || 'user',
      tenantId: req.user.tenantId
    });

    await AuditLog.create({
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: user.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    const userData = user.toJSON();
    delete userData.password_hash;
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      data: userData 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { tenantId: req.user.tenantId };
    if (role) whereClause.role = role;
    if (search) {
      const { Op } = require('sequelize');
      whereClause[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({ 
      success: true, 
      data: {
        users: rows,
        total: count,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { fullName, role, is_active } = req.body;
    const userId = req.params.id;
    
    // Authorization: user can update own fullName, only tenant_admin can change role/status
    if (req.user.id !== userId && req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this user' });
    }

    const user = await User.findOne({ where: { id: userId, tenantId: req.user.tenantId }});
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Only tenant_admin can update role and status
    if (req.user.role !== 'tenant_admin') {
      // Regular users can only update their own fullName
      await user.update({ fullName: fullName || user.fullName });
    } else {
      // Tenant admin can update all fields
      await user.update({ 
        fullName: fullName !== undefined ? fullName : user.fullName,
        role: role !== undefined ? role : user.role,
        is_active: is_active !== undefined ? is_active : user.is_active
      });
    }

    await AuditLog.create({
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: user.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    const userData = user.toJSON();
    delete userData.password_hash;
    
    res.json({ success: true, message: 'User updated successfully', data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Only admins can delete users' });
    }

    // Prevent self-deletion
    if (req.params.id === req.user.id) {
        return res.status(403).json({ success: false, message: 'Cannot delete yourself' });
    }

    const userToDelete = await User.findOne({ 
      where: { id: req.params.id, tenantId: req.user.tenantId } 
    });

    if (!userToDelete) return res.status(404).json({ success: false, message: 'User not found' });

    // Set assigned_to to NULL for all tasks assigned to this user
    const { Task } = require('../models');
    await Task.update(
      { assignedTo: null },
      { where: { assignedTo: req.params.id } }
    );

    await userToDelete.destroy();

    await AuditLog.create({
      action: 'DELETE_USER',
      entityType: 'User',
      entityId: req.params.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};