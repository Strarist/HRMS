const SENSITIVE_KEYS = new Set([
  'password', 'token', 'jwt', 'authorization', 'secret', 'resettoken',
  'access_token', 'accesstoken', 'refreshtoken', 'otp', 'resume', 'payslip', 'document'
]);

function sanitize(meta = {}) {
  const out = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(String(key).toLowerCase())) continue;
    if (typeof value === 'string' && value.length > 240) {
      out[key] = `${value.slice(0, 240)}…`;
    } else {
      out[key] = value;
    }
  }
  return out;
}

function audit(event, meta = {}) {
  const payload = {
    ts: new Date().toISOString(),
    event,
    ...sanitize(meta)
  };
  console.log(`[audit] ${JSON.stringify(payload)}`);
}

module.exports = { audit, sanitize };
