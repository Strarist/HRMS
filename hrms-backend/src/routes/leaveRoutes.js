const express = require('express');
const router = express.Router();
const {
  getLeaves,
  getLeave,
  createLeave,
  updateLeave,
  approveLeave,
  rejectLeave,
  deleteLeave
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middlewares/auth');
const { tenantMiddleware } = require('../middlewares/tenantMiddleware');
const { requirePermission } = require('../middlewares/rbac');
const { PERMISSIONS } = require('../config/permissions');

router.use(protect);
router.use(tenantMiddleware);

router.route('/')
  .get(getLeaves)
  .post(createLeave);

router.put('/:id/approve', authorize('admin', 'hr', 'company_admin', 'manager'), requirePermission(PERMISSIONS.LEAVE_APPROVE), approveLeave);
router.put('/:id/reject', authorize('admin', 'hr', 'company_admin', 'manager'), requirePermission(PERMISSIONS.LEAVE_APPROVE), rejectLeave);

router.route('/:id')
  .get(getLeave)
  .put(updateLeave)
  .delete(deleteLeave);

module.exports = router;
