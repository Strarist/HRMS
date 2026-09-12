/**
 * Task Controller - Tenant-scoped operational tasks
 * manager/company_admin: full CRUD
 * employee: read own tasks, update own task status
 */
const { getTenantConnection } = require("../config/database.config");
const TaskSchema = require("../models/tenant/Task");
const { normalizeRole } = require("../utils/roles");
const mongoose = require("mongoose");

function getModel(connection) {
  if (connection.models.Task) return connection.models.Task;
  return connection.model("Task", TaskSchema);
}

// GET /api/tasks/my-tasks  - tasks assigned to the calling user
exports.getMyTasks = async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company context missing" });

    const tenantConn = await getTenantConnection(companyId);
    const Task = getModel(tenantConn);

    const filter = { assigneeId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.projectId) filter.projectId = req.query.projectId;

    const tasks = await Task.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    console.error("[tasks] getMyTasks error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

// GET /api/tasks  - manager/admin sees all or filtered tasks
exports.getTasks = async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company context missing" });

    const tenantConn = await getTenantConnection(companyId);
    const Task = getModel(tenantConn);

    const filter = {};
    if (req.query.assigneeId) filter.assigneeId = req.query.assigneeId;
    if (req.query.projectId) filter.projectId = req.query.projectId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(200)
      .lean();

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    console.error("[tasks] getTasks error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

// POST /api/tasks  - manager/admin creates task for assignee
exports.createTask = async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company context missing" });

    const { title, description, assigneeId, assigneeEmail, projectId, dueDate, priority } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: "Task title is required" });
    if (!assigneeId) return res.status(400).json({ success: false, message: "Assignee is required" });
    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      return res.status(400).json({ success: false, message: "Invalid assignee ID" });
    }

    const tenantConn = await getTenantConnection(companyId);
    const Task = getModel(tenantConn);

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : undefined,
      assigneeId,
      assigneeEmail: assigneeEmail ? assigneeEmail.toLowerCase() : undefined,
      createdBy: req.user._id,
      projectId: projectId || undefined,
      dueDate: dueDate || undefined,
      priority: priority || "medium",
      status: "pending"
    });

    console.log(`[tasks] created: ${task._id} assignee=${assigneeId} company=${companyId}`);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error("[tasks] createTask error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

// PUT /api/tasks/:id/status  - assignee updates own task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company context missing" });

    const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
    const { status } = req.body;
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be: ${validStatuses.join(", ")}` });
    }

    const tenantConn = await getTenantConnection(companyId);
    const Task = getModel(tenantConn);
    const role = normalizeRole(req.user.role);

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Employees can only update their own tasks; managers/admin can update any
    if (role === "employee" && String(task.assigneeId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this task" });
    }

    task.status = status;
    if (status === "completed") task.completedAt = new Date();
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error("[tasks] updateTaskStatus error:", err.message);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
};
