const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { forbidCrossTenantBody } = require('../src/middlewares/rbac');

describe('tenant isolation & boundary protection', () => {
  it('allows requests when body companyId matches authenticated companyId', () => {
    const middleware = forbidCrossTenantBody(['companyId']);
    const req = {
      user: { _id: 'u1', role: 'company_admin', companyId: 'tenant_123' },
      companyId: 'tenant_123',
      body: { companyId: 'tenant_123', name: 'Test' }
    };
    let calledNext = false;
    const res = {};
    middleware(req, res, () => { calledNext = true; });
    assert.equal(calledNext, true);
  });

  it('blocks and returns 403 when body companyId mismatches authenticated companyId', () => {
    const middleware = forbidCrossTenantBody(['companyId', 'clientId']);
    const req = {
      user: { _id: 'u1', role: 'company_admin', companyId: 'tenant_A' },
      companyId: 'tenant_A',
      body: { companyId: 'tenant_B_attacker', data: 'malicious' }
    };
    let statusCode = 0;
    let jsonBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        jsonBody = payload;
        return this;
      }
    };
    middleware(req, res, () => {
      assert.fail('Should not call next on tenant mismatch');
    });

    assert.equal(statusCode, 403);
    assert.equal(jsonBody?.success, false);
    assert.match(jsonBody?.message, /Cross-tenant access denied/i);
  });

  it('blocks when spoofed clientId is supplied in query parameters', () => {
    const middleware = forbidCrossTenantBody(['clientId']);
    const req = {
      user: { _id: 'u1', role: 'hr', companyId: 'tenant_A' },
      companyId: 'tenant_A',
      query: { clientId: 'tenant_Other' }
    };
    let statusCode = 0;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json() { return this; }
    };
    middleware(req, res, () => {
      assert.fail('Should not proceed');
    });
    assert.equal(statusCode, 403);
  });

  it('allows superadmin to operate without cross-tenant rejection', () => {
    const middleware = forbidCrossTenantBody(['companyId']);
    const req = {
      user: { _id: 'sa1', role: 'superadmin' },
      body: { companyId: 'any_tenant' }
    };
    let calledNext = false;
    const res = {};
    middleware(req, res, () => { calledNext = true; });
    assert.equal(calledNext, true);
  });
});
