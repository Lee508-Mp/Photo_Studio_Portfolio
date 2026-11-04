const crypto = require('crypto');
const { sessionSecret, isProd } = require('../config');

const TTL_MS = 8 * 60 * 60 * 1000;
const sign = p => crypto.createHmac('sha256', sessionSecret).update(p).digest('base64url');

exports.create = username => {
  const p = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + TTL_MS })).toString('base64url');
  return `${p}.${sign(p)}`;
};
exports.read = token => {
  if (!token || !token.includes('.')) return null;
  const [p, s] = token.split('.');
  const a = Buffer.from(s), b = Buffer.from(sign(p));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const d = JSON.parse(Buffer.from(p, 'base64url'));
    return d.exp > Date.now() ? d : null;
  } catch { return null; }
};
exports.fromRequest = req => {
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)admin_session=([^;]+)/);
  return m ? m[1] : null;
};
exports.cookie = token =>
  `admin_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${token ? TTL_MS / 1000 : 0}${isProd ? '; Secure' : ''}`;
