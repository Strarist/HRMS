const { verifyToken } = require('../utils/jwt');
const TenantUserSchema = require('../models/tenant/TenantUser');
const { getTenantConnection } = require('../config/database.config');
const { getSuperAdmin } = require('../models/global');
const tokenBlacklistService = require('../services/tokenBlacklistService');
const { normalizeRole, roleAllowed } = require('../utils/roles');
const { audit } = require('../utils/auditLog');

function isPasswordChangeAllowed(req) {
  const method = req.method.toUpperCase();
  const fullPath = (req.originalUrl || req.url || '').split('?')[0];
  if (method === 'PUT' && /\/api\/auth\/updatepassword\/?$/.test(fullPath)) return true;
  if (method === 'POST' && /\/api\/auth\/logout\/?$/.test(fullPath)) return true;
  if (method === 'GET' && /\/api\/auth\/me\/?$/.test(fullPath)) return true;
  return false;
}

const protect = async (req, res, next) => {
  let tenantConnection = null;
  
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && (req.query.access_token || req.query.token)) {
      // Browser downloads / iframes cannot set Authorization headers
      token = req.query.access_token || req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // SECURITY: Check if token is blacklisted
    const isBlacklisted = await tokenBlacklistService.isBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked. Please login again.',
        code: 'TOKEN_REVOKED'
      });
    }

    // Handle both 'id' and 'userId' fields for backward compatibility
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: missing user identifier'
      });
    }

    let user = null;

    // Check if token contains company info (tenant user)
    if (decoded.companyId) {
      // User is from a tenant database
      try {
        console.log(`🔍 Auth middleware: Fetching user from tenant DB for company: ${decoded.companyId}, userId: ${userId}`);
        tenantConnection = await getTenantConnection(decoded.companyId);
        const TenantUser = tenantConnection.model('User', TenantUserSchema);
        user = await TenantUser.findById(userId).select('-password');
        
        if (user) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ User found in tenant DB: ${user.email}`);
          }
        } else {
          console.error(`❌ User not found in tenant DB. userId: ${userId}, companyId: ${decoded.companyId}`);
        }
        
        // Don't close the connection - it's cached and reused by getTenantConnection
      } catch (tenantError) {
        console.error('❌ Error accessing tenant database:', {
          message: tenantError.message,
          companyId: decoded.companyId,
          userId: userId
        });
        return res.status(500).json({
          success: false,
          message: 'Error accessing company database'
        });
      }
    } else {
      // User is from main database (super admin, etc.)
      const SuperAdmin = await getSuperAdmin();
      user = await SuperAdmin.findById(userId).select('-password');
      if (!user) {
        console.error(`❌ Super admin not found. userId: ${userId}`);
      }
    }

    if (!user) {
      console.error('❌ User not found. Token details:', {
        userId: userId,
        companyId: decoded.companyId || 'none',
        email: decoded.email || 'none',
        tokenIssuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'unknown'
      });
      return res.status(404).json({
        success: false,
        message: 'User not found. Please login again.',
        code: 'USER_NOT_FOUND'
      });
    }

    // SECURITY: Check if all user tokens are blacklisted (for exited employees)
    const isUserBlacklisted = await tokenBlacklistService.isUserBlacklisted(userId);
    if (isUserBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Access has been revoked. Please contact HR.',
        code: 'ACCESS_REVOKED'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Authorization uses the database role, never the JWT role claim
    user.role = normalizeRole(user.role) || user.role;
    req.user = user;
    if (decoded.companyId) {
      req.user.companyId = decoded.companyId;
      req.companyId = decoded.companyId;
      req.companyCode = decoded.companyCode;
      req.databaseName = decoded.databaseName;
      
      // Attach tenant connection for controllers that need it
      req.tenant = {
        connection: tenantConnection,
        companyId: decoded.companyId
      };
    }

    // Server-side forced password change (UI alone is not enough)
    const mustChange = !!(user.mustChangePassword || user.isFirstLogin);
    if (mustChange && !isPasswordChangeAllowed(req)) {
      return res.status(403).json({
        success: false,
        message: 'Password change required before accessing this resource',
        code: 'PASSWORD_CHANGE_REQUIRED'
      });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Don't close tenant connection - it's cached and reused
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!roleAllowed(userRole, roles)) {
      audit('permission_denied', {
        userId: req.user?._id,
        role: normalizeRole(userRole),
        companyId: req.companyId,
        path: (req.originalUrl || '').split('?')[0],
        method: req.method
      });
      return res.status(403).json({
        success: false,
        message: `User role '${normalizeRole(userRole) || userRole}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Super Admin specific middleware
const requireSuperAdmin = (req, res, next) => {
  if (normalizeRole(req.user?.role) !== 'superadmin') {
    audit('permission_denied', {
      userId: req.user?._id,
      role: normalizeRole(req.user?.role),
      path: (req.originalUrl || '').split('?')[0],
      method: req.method
    });
    return res.status(403).json({
      success: false,
      message: 'Super Admin access required'
    });
  }
  next();
};

// Tenant isolation middleware - ensures users can only access their client's data
const tenantIsolation = async (req, res, next) => {
  try {
    // Super admins can access all data
    if (req.user.role === 'superadmin') {
      return next();
    }

    const companyId = req.companyId || req.user.companyId;
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'User not associated with any tenant'
      });
    }

    req.clientId = companyId;
    req.companyId = companyId;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in tenant isolation'
    });
  }
};

module.exports = { protect, authorize, requireSuperAdmin, tenantIsolation };
