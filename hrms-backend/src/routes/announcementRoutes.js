const express = require("express");
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middlewares/auth");
const { tenantMiddleware } = require("../middlewares/tenantMiddleware");

router.use(protect);
router.use(tenantMiddleware);

// All authenticated tenant users can read
router.get("/", authorize("company_admin", "hr", "manager", "employee"), getAnnouncements);

// Only company_admin and manager can create
router.post("/", authorize("company_admin", "manager"), createAnnouncement);

// Update / soft-delete — authorization checked inside controller (creator or company_admin)
router.put("/:id", authorize("company_admin", "manager"), updateAnnouncement);
router.delete("/:id", authorize("company_admin", "manager"), deleteAnnouncement);

module.exports = router;
