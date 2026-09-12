/**
 * Canonical tenant/global roles. Authorization must use these values from
 * the authenticated database record — never from email heuristics or client claims.
 */
const CANONICAL_ROLES = Object.freeze({
  SUPERADMIN: 'superadmin',
  COMPANY_ADMIN: 'company_admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
});

const TENANT_ROLES = Object.freeze([
  CANONICAL_ROLES.COMPANY_ADMIN,
  CANONICAL_ROLES.HR,
  CANONICAL_ROLES.MANAGER,
  CANONICAL_ROLES.EMPLOYEE
]);

/**
 * Map leftover `admin` records to company_admin. Do not infer roles from email.
 */
function normalizeRole(role) {
  if (!role || typeof role !== 'string') return null;
  const value = role.trim().toLowerCase();
  if (value === 'admin') return CANONICAL_ROLES.COMPANY_ADMIN;
  if (Object.values(CANONICAL_ROLES).includes(value)) return value;
  return value;
}

function isCompanyAdmin(role) {
  const normalized = normalizeRole(role);
  return normalized === CANONICAL_ROLES.COMPANY_ADMIN;
}

function isSuperAdmin(role) {
  return normalizeRole(role) === CANONICAL_ROLES.SUPERADMIN;
}

function roleAllowed(userRole, allowedRoles = []) {
  const normalized = normalizeRole(userRole);
  if (!normalized) return false;
  const allowed = allowedRoles.map(normalizeRole).filter(Boolean);
  if (allowed.includes(normalized)) return true;
  // Legacy route lists often include `admin` instead of `company_admin`
  if (normalized === CANONICAL_ROLES.COMPANY_ADMIN && allowed.includes('admin')) return true;
  return false;
}

module.exports = {
  CANONICAL_ROLES,
  TENANT_ROLES,
  normalizeRole,
  isCompanyAdmin,
  isSuperAdmin,
  roleAllowed
};
