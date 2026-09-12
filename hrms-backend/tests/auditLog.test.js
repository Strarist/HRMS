const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { sanitize } = require('../src/utils/auditLog');

describe('audit log sanitization', () => {
  it('strips secrets', () => {
    const out = sanitize({
      password: 'secret',
      token: 'jwt-here',
      userId: 'abc',
      resetToken: 'reset'
    });
    assert.equal(out.password, undefined);
    assert.equal(out.token, undefined);
    assert.equal(out.resetToken, undefined);
    assert.equal(out.userId, 'abc');
  });
});
