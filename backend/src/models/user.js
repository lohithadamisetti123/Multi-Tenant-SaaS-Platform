const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash'
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'tenant_admin', 'user'),
    defaultValue: 'user'
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'tenant_id'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email', 'tenant_id']
    }
  ]
});

module.exports = User;