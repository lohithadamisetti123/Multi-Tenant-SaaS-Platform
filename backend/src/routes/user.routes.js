const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

/*
 API 8: Add user to tenant
 POST /api/tenants/:tenantId/users
*/
router.post(
  "/tenants/:tenantId/users",
  auth,
  userController.createUser
);

/*
 API 9: List tenant users
 GET /api/tenants/:tenantId/users
*/
router.get(
  "/tenants/:tenantId/users",
  auth,
  userController.listUsers
);

/*
 API 10: Update user
 PUT /api/users/:userId
*/
router.put(
  "/users/:userId",
  auth,
  userController.updateUser
);

/*
 API 11: Delete user
 DELETE /api/users/:userId
*/
router.delete(
  "/users/:userId",
  auth,
  userController.deleteUser
);

module.exports = router;
