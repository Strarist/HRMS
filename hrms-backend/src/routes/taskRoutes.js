const express = require("express");
const router = express.Router();
const { getMyTasks, getTasks, createTask, updateTaskStatus } = require("../controllers/taskController");
const { protect, authorize } = require("../middlewares/auth");
const { tenantMiddleware } = require("../middlewares/tenantMiddleware");

router.use(protect);
router.use(tenantMiddleware);

// Employee reads own assigned tasks
router.get("/my-tasks", getMyTasks);

// Manager/admin reads all (or filtered) tasks
router.get("/", authorize("company_admin", "hr", "manager"), getTasks);

// Manager/admin creates task
router.post("/", authorize("company_admin", "manager"), createTask);

// Assignee updates task status (authorization checked inside controller)
router.put("/:id/status", updateTaskStatus);

module.exports = router;
