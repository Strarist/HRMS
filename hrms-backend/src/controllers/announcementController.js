/**
 * Announcement Controller - Tenant-scoped CRUD
 * company_admin and manager: create/update/delete their own
 * employee / hr: read active, non-expired announcements
 */
const { getTenantConnection } = require("../config/database.config");
const AnnouncementSchema = require("../models/tenant/Announcement");
const { normalizeRole } = require("../utils/roles");

function getModel(connection) {
  if (connection.models.Announcement) return connection.models.Announcement;
  return connection.model("Announcement", AnnouncementSchema);
}

// GET /api/announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company context missing" });

    const tenantConn = await getTenantConnection(companyId);
    const Announcement = getModel(tenantConn);
    const role = normalizeRole(req.user.role);
    const now = new Date();

    // Build audience filter for non-admin roles
    const query = { isActive: true };

    // Only show scheduled announcements that are due
    query.$or = [
      { scheduledFor: { $exists: false } },
      { scheduledFor: { $lte: now } }
    ];

    // Only show non-expired
    query.$and = [
      { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }] }
    ];

    // Audience restriction for employees
    if (role === "employee") {
      query.targetAudience = { $in: ["all", "employees"] };
    } else if (role === "manager") {
      query.targetAudience = { $in: ["all", "employees", "managers"] };
    }
    // company_admin and hr see all

    const announcements = await Announcement.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({ success: true, count: announcements.length, data: announcements });
  } catch (err) {
    console.error("[announcements] getAnnouncements error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch announcements" });
  }
};

// POST /api/announcements
exports.createAnnouncement = async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company context missing" });

    const { title, message, priority, targetAudience, scheduledFor, expiresAt } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: "Title is required" });
    if (!message || !message.trim()) return res.status(400).json({ success: false, message: "Message is required" });

    const tenantConn = await getTenantConnection(companyId);
    const Announcement = getModel(tenantConn);

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      priority: priority || "normal",
      targetAudience: targetAudience || "all",
      scheduledFor: scheduledFor || undefined,
      expiresAt: expiresAt || undefined,
      createdBy: req.user._id,
      createdByEmail: req.user.email,
      createdByName: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || req.user.email,
      isActive: true
    });

    console.log(`[announcements] created: ${announcement._id} by ${req.user.email} company=${companyId}`);
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    console.error("[announcements] createAnnouncement error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create announcement" });
  }
};

// PUT /api/announcements/:id
exports.updateAnnouncement = async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company context missing" });

    const tenantConn = await getTenantConnection(companyId);
    const Announcement = getModel(tenantConn);
    const role = normalizeRole(req.user.role);

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });

    // Only creator or company_admin can update
    if (role !== "company_admin" && String(announcement.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this announcement" });
    }

    const allowed = ["title", "message", "priority", "targetAudience", "scheduledFor", "expiresAt", "isActive"];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) announcement[key] = req.body[key];
    });
    await announcement.save();

    res.status(200).json({ success: true, data: announcement });
  } catch (err) {
    console.error("[announcements] updateAnnouncement error:", err.message);
    res.status(500).json({ success: false, message: "Failed to update announcement" });
  }
};

// DELETE /api/announcements/:id  (soft delete)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company context missing" });

    const tenantConn = await getTenantConnection(companyId);
    const Announcement = getModel(tenantConn);
    const role = normalizeRole(req.user.role);

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });

    if (role !== "company_admin" && String(announcement.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this announcement" });
    }

    announcement.isActive = false;
    await announcement.save();
    console.log(`[announcements] soft-deleted: ${announcement._id} by ${req.user.email}`);
    res.status(200).json({ success: true, message: "Announcement removed" });
  } catch (err) {
    console.error("[announcements] deleteAnnouncement error:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete announcement" });
  }
};
