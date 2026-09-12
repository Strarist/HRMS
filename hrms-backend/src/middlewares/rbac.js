const { hasPermission } = require('../config/permissions');
const { normalizeRole, roleAllowed } = require('../utils/roles');
const { audit } = require('../utils/auditLog');

function currentRole(req) {
  return normalizeRole(req.user?.role);
}

function deny(req, res, message, extra = {}) {
  audit('permission_denied', {
    userId: req.user?._id,
    role: currentRole(req),
    companyId: req.companyId,
    path: (req.originalUrl || req.url || '').split('?')[0],
    method: req.method,
    ...extra
  });
  return res.status(403).json({
    success: false,
    message
  });
}

/**
 * Require one or more permission codes. Superadmin is never granted tenant
 * operational permissions implicitly — only platform.superadmin.
 */
function requirePermission(...permissionCodes) {
  const required = permissionCodes.filter(Boolean);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const role = currentRole(req);
    const ok = required.some((code) => hasPermission(role, code));
    if (!ok) {
      return deny(req, res, 'Insufficient permissions for this action', {
        required: required.join(',')
      });
    }
    next();
  };
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (!roleAllowed(req.user.role, roles)) {
      return deny(req, res, `User role '${normalizeRole(req.user.role)}' is not authorized to access this route`);
    }
    next();
  };
}

function forbidCrossTenantBody(fields = ['companyId', 'clientId', 'tenantId']) {
  return (req, res, next) => {
    if (!req.user || currentRole(req) === 'superadmin') {
      return next();
    }
    const trusted = req.companyId || req.user.companyId;
    if (!trusted) {
      return deny(req, res, 'Tenant context missing');
    }
    for (const field of fields) {
      const supplied = req.body?.[field] || req.query?.[field] || req.params?.[field];
      if (supplied && String(supplied) !== String(trusted)) {
        audit('cross_tenant_rejected', {
          userId: req.user._id,
          companyId: trusted,
          field,
          path: (req.originalUrl || '').split('?')[0]
        });
        return res.status(403).json({
          success: false,
          message: 'Cross-tenant access denied'
        });
      }
    }
    next();
  };
}

module.exports = {
  requirePermission,
  requireRoles,
  forbidCrossTenantBody
};
