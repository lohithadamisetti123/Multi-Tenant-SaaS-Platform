const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
  createProject,
  listProjects,
  updateProject,
  deleteProject
} = require("../controllers/project.controller");

// Create project
router.post("/", authMiddleware, createProject);

// List projects
router.get("/", authMiddleware, listProjects);

// Update project
router.put("/:projectId", authMiddleware, updateProject);

// Delete project
router.delete("/:projectId", authMiddleware, deleteProject);

module.exports = router;
