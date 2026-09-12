const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { normalizeRole } = require('../src/utils/roles');
const TenantUserSchema = require('../src/models/tenant/TenantUser');

describe('authentication & password security', () => {
  it('enforces minimum 8 characters in TenantUser password validation', () => {
    const minLengthProp = TenantUserSchema.path('password').options.minlength;
    const minLen = Array.isArray(minLengthProp) ? minLengthProp[0] : minLengthProp;
    assert.equal(minLen, 8, 'Password minlength must be at least 8');
  });

  it('correctly compares bcrypt password hashes', async () => {
    const plain = 'StrongPass@2026';
    const hash = await bcrypt.hash(plain, 10);
    const matches = await bcrypt.compare(plain, hash);
    const fails = await bcrypt.compare('WrongPassword', hash);
    assert.equal(matches, true);
    assert.equal(fails, false);
  });

  it('signs and verifies JWT with correct claims', () => {
    const secret = 'test-secret-key-12345';
    const payload = {
      id: '654321000000000000000001',
      role: 'company_admin',
      companyId: '696b515db6c9fd5fd51aed1c'
    };

    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);

    assert.equal(decoded.id, payload.id);
    assert.equal(normalizeRole(decoded.role), 'company_admin');
    assert.equal(decoded.companyId, payload.companyId);
  });

  it('rejects expired JWT tokens', async () => {
    const secret = 'test-secret-key-12345';
    const token = jwt.sign({ id: '123' }, secret, { expiresIn: '0s' });
    // Wait briefly for expiration
    await new Promise((r) => setTimeout(r, 10));
    assert.throws(() => {
      jwt.verify(token, secret);
    }, /jwt expired/);
  });
});
