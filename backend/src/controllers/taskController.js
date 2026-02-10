const { Task, Project, AuditLog } = require('../models');

exports.createTask = async (req, res) => {
  try {
    // Support both body and params for projectId (nested route: /projects/:projectId/tasks)
    const projectId = req.params.projectId || req.body.projectId;
    const { title, description, assignedTo, priority, dueDate } = req.body;
    
    // Validation
    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'title and projectId are required' });
    }

    // Verify project exists and belongs to tenant
    const project = await Project.findOne({ 
        where: { id: projectId, tenantId: req.user.tenantId } 
    });
    if (!project) return res.status(403).json({ success: false, message: 'Project not accessible' });

    // If assignedTo provided, verify user belongs to same tenant
    if (assignedTo) {
      const assignedUser = await require('../models').User.findOne({
        where: { id: assignedTo, tenantId: req.user.tenantId }
      });
      if (!assignedUser) {
        return res.status(400).json({ success: false, message: 'Assigned user not in this tenant' });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      projectId,
      tenantId: req.user.tenantId,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      status: 'todo'
    });

    // Include assignee details
    const taskData = task.toJSON();
    if (assignedTo) {
      const assignee = await require('../models').User.findByPk(assignedTo, {
        attributes: { exclude: ['password_hash'] }
      });
      taskData.assignedTo = assignee;
    }

    await AuditLog.create({
      action: 'CREATE_TASK',
      entityType: 'Task',
      entityId: task.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.status(201).json({ success: true, data: taskData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    // Support both query and params for projectId (nested route: /projects/:projectId/tasks)
    const projectId = req.params.projectId || req.query.projectId;
    const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify project belongs to tenant if specified
    if (projectId) {
      const project = await Project.findOne({
        where: { id: projectId, tenantId: req.user.tenantId }
      });
      if (!project) {
        return res.status(403).json({ success: false, message: 'Project not accessible' });
      }
    }

    const whereClause = { tenantId: req.user.tenantId };
    if (projectId) whereClause.projectId = projectId;
    if (status) whereClause.status = status;
    if (assignedTo) whereClause.assignedTo = assignedTo;
    if (priority) whereClause.priority = priority;
    if (search) {
      whereClause.title = { [require('sequelize').Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        { model: require('../models').User, as: 'assignee', attributes: { exclude: ['password_hash'] } }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['priority', 'DESC'], ['dueDate', 'ASC']]
    });

    // Transform response
    const tasks = rows.map(t => {
      const task = t.toJSON();
      if (t.assignee) {
        task.assignedTo = t.assignee;
      }
      return task;
    });

    res.json({ 
      success: true, 
      data: {
        tasks,
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

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const task = await Task.findOne({ where: { id, tenantId: req.user.tenantId } });
    
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    task.status = status;
    await task.save();

    await AuditLog.create({
      action: 'UPDATE_TASK_STATUS',
      entityType: 'Task',
      entityId: task.id,
      tenantId: req.user.tenantId,
      userId: req.user.id,
      details: { status }
    });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    const task = await Task.findOne({ 
      where: { id: req.params.id, tenantId: req.user.tenantId }
    });

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await task.update({ status });

    await AuditLog.create({
      action: 'UPDATE_TASK',
      entityType: 'Task',
      entityId: task.id,
      tenantId: req.user.tenantId,
      userId: req.user.id,
      details: { field: 'status', newValue: status }
    });

    // Reload with associations
    await task.reload({ include: [{ model: require('../models').User, as: 'assignee' }] });

    const taskData = task.toJSON();
    if (task.assignee) {
      taskData.assignedTo = task.assignee;
    }

    res.json({ success: true, message: 'Task status updated successfully', data: taskData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const task = await Task.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId }});

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Validate assignedTo if provided
    if (assignedTo !== undefined && assignedTo !== null) {
      const assignedUser = await require('../models').User.findOne({
        where: { id: assignedTo, tenantId: req.user.tenantId }
      });
      if (!assignedUser) {
        return res.status(400).json({ success: false, message: 'Assigned user not in this tenant' });
      }
    }

    await task.update({ 
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      status: status !== undefined ? status : task.status,
      priority: priority !== undefined ? priority : task.priority,
      assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate
    });

    // Reload with associations
    await task.reload({ include: [{ model: require('../models').User, as: 'assignee' }] });

    await AuditLog.create({
      action: 'UPDATE_TASK',
      entityType: 'Task',
      entityId: task.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    const taskData = task.toJSON();
    if (task.assignee) {
      taskData.assignedTo = task.assignee;
    }

    res.json({ success: true, message: 'Task updated successfully', data: taskData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      where: { id: req.params.id, tenantId: req.user.tenantId } 
    });

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await task.destroy();

    await AuditLog.create({
      action: 'DELETE_TASK',
      entityType: 'Task',
      entityId: req.params.id,
      tenantId: req.user.tenantId,
      userId: req.user.id
    });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};