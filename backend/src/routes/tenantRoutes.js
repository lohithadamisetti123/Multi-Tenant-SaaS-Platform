const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', tenantController.listTenants);
router.get('/:id', tenantController.getTenant);
router.put('/:id', tenantController.updateTenant);

// Users under tenant
router.post('/:tenantId/users', userController.createUser);
router.get('/:tenantId/users', userController.listUsers);

module.exports = router;