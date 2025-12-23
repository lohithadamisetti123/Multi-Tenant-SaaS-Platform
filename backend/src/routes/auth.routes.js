const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/auth.controller');

const router = express.Router();

router.post(
  '/register-tenant',
  [
    body('tenantName').notEmpty(),
    body('subdomain').notEmpty(),
    body('adminEmail').isEmail(),
    body('adminPassword').isLength({ min: 8 }),
    body('adminFullName').notEmpty(),
  ],
  controller.registerTenant
);

module.exports = router;
