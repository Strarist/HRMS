const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeRole, roleAllowed, CANONICAL_ROLES } = require('../src/utils/roles');
const { hasPermission, PERMISSIONS } = require('../src/config/permissions');

describe('canonical roles', () => {
  it('maps leftover admin to company_admin', () => {
    assert.equal(normalizeRole('admin'), CANONICAL_ROLES.COMPANY_ADMIN);
    assert.equal(normalizeRole('ADMIN'), CANONICAL_ROLES.COMPANY_ADMIN);
  });

  it('does not infer roles from email-like strings', () => {
    assert.equal(normalizeRole('hr@spc.com'), 'hr@spc.com');
    assert.notEqual(normalizeRole('admin@company.com'), CANONICAL_ROLES.COMPANY_ADMIN);
  });

  it('treats admin allow-lists as company_admin', () => {
    assert.equal(roleAllowed('company_admin', ['admin', 'hr']), true);
    assert.equal(roleAllowed('hr', ['admin']), false);
    assert.equal(roleAllowed('employee', ['admin', 'company_admin']), false);
  });
});

describe('rbac matrix', () => {
  it('denies employees admin actions', () => {
    assert.equal(hasPermission('employee', PERMISSIONS.EMPLOYEE_CREATE), false);
    assert.equal(hasPermission('employee', PERMISSIONS.LEAVE_APPROVE), false);
    assert.equal(hasPermission('employee', PERMISSIONS.COMPANY_MANAGE), false);
    assert.equal(hasPermission('employee', PERMISSIONS.LEAVE_APPLY), true);
  });

  it('denies managers company-admin actions', () => {
    assert.equal(hasPermission('manager', PERMISSIONS.EMPLOYEE_DELETE), false);
    assert.equal(hasPermission('manager', PERMISSIONS.COMPANY_MANAGE), false);
    assert.equal(hasPermission('manager', PERMISSIONS.LEAVE_APPROVE), true);
  });

  it('denies HR super-admin / billing platform access', () => {
    assert.equal(hasPermission('hr', PERMISSIONS.SUPERADMIN), false);
    assert.equal(hasPermission('hr', PERMISSIONS.BILLING_MANAGE), false);
    assert.equal(hasPermission('hr', PERMISSIONS.CANDIDATE_CREATE), true);
  });

  it('does not grant tenant ops to superadmin via tenant matrix', () => {
    assert.equal(hasPermission('superadmin', PERMISSIONS.SUPERADMIN), true);
    assert.equal(hasPermission('superadmin', PERMISSIONS.EMPLOYEE_DELETE), false);
  });
});
