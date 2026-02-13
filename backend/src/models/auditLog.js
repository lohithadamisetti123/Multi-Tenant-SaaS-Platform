const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'entity_type'
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'entity_id'
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address'
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'tenant_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'audit_logs'
});

module.exports = AuditLog;