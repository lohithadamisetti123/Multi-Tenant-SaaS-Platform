const express = require('express');
const router = express.Router();

const tenantController = require('../controllers/tenant.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.get(
  '/:tenantId',
  authMiddleware,
  tenantController.getTenantById
);

router.put(
  '/:tenantId',
  authMiddleware,
  roleMiddleware(['tenant_admin', 'super_admin']),
  tenantController.updateTenant
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware(['super_admin']),
  tenantController.listTenants
);

module.exports = router;
