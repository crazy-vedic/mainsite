const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const CLIENT_ID_HEADER = 'x-client-id';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeClientId(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, 36);
  return UUID_RE.test(trimmed) ? trimmed.toLowerCase() : null;
}

function getClientFingerprint(req) {
  const clientId = normalizeClientId(req.get(CLIENT_ID_HEADER));
  if (clientId) {
    return `fp:${clientId}`;
  }

  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  return `ip:${ip}`;
}

function hashKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex').slice(0, 32);
}

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => hashKey(getClientFingerprint(req)),
  message: { error: 'Rate limit exceeded. Please wait a minute before sending another message.' },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before sending another message.',
      fingerprint: getClientFingerprint(req).startsWith('fp:') ? 'client' : 'ip',
    });
  },
});

module.exports = {
  chatLimiter,
  CLIENT_ID_HEADER,
  getClientFingerprint,
};
