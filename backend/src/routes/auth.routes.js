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
router.post('/login', controller.login);
const auth = require('../middleware/auth.middleware');

router.get('/me', auth, controller.me);
router.post('/logout', auth, controller.logout);


module.exports = router;
