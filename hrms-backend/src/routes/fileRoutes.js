const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { normalizeRole } = require('../utils/roles');
const { audit } = require('../utils/auditLog');

const uploadsRoot = path.resolve(__dirname, '../../uploads');

const HR_FILE_ROLES = new Set(['admin', 'hr', 'company_admin', 'superadmin']);

/**
 * Authenticated file download. Tenant identity comes from the JWT, not the path.
 */
router.get(/.*/, protect, (req, res) => {
  try {
    const relative = (req.path || '').replace(/^\/+/, '');
    if (!relative || relative.includes('\0')) {
      return res.status(400).json({ success: false, message: 'Invalid path' });
    }

    const resolved = path.resolve(uploadsRoot, relative);
    if (!resolved.startsWith(uploadsRoot + path.sep) && resolved !== uploadsRoot) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const role = normalizeRole(req.user?.role);
    const companyId = req.companyId || req.user?.companyId;
    const normalized = relative.replace(/\\/g, '/').toLowerCase();

    if (normalized.startsWith('candidate-documents/') && !HR_FILE_ROLES.has(role)) {
      audit('file_access_denied', { userId: req.user?._id, role, companyId, reason: 'candidate_docs' });
      return res.status(403).json({ success: false, message: 'Not authorized to access this document' });
    }

    // If a path embeds a tenant prefix, it must match the authenticated tenant
    const tenantMatch = normalized.match(/(?:^|\/)tenant_([a-f0-9]{24})(?:\/|$)/);
    if (tenantMatch && role !== 'superadmin') {
      const pathTenant = tenantMatch[1];
      if (!companyId || String(companyId) !== pathTenant) {
        audit('cross_tenant_rejected', {
          userId: req.user?._id,
          companyId,
          reason: 'file_path_tenant_mismatch'
        });
        return res.status(403).json({ success: false, message: 'Cross-tenant access denied' });
      }
    }

    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.sendFile(resolved);
  } catch (error) {
    console.error('File serve error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to serve file' });
  }
});

module.exports = router;
