require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const isProd = process.env.NODE_ENV === 'production';

let sessionSecret = process.env.SESSION_SECRET || '';
if (sessionSecret.length < 32) {
  if (isProd) throw new Error('SESSION_SECRET must be at least 32 characters in production.');
  sessionSecret = crypto.randomBytes(32).toString('hex'); // dev only: logins reset on restart
}

module.exports = {
  root, isProd, sessionSecret,
  port: process.env.PORT || 3000,
  dbPath: process.env.DB_PATH || path.join(root, 'data', 'portfolio.db'),
  uploadDir: process.env.UPLOAD_DIR || path.join(root, 'uploads'),
  admin: { username: process.env.ADMIN_USERNAME || '', password: process.env.ADMIN_PASSWORD || '' },
  site: {
    whatsapp: (process.env.SITE_WHATSAPP || process.env.OWNER_WHATSAPP || '').replace(/\D/g, ''),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.CONTACT_EMAIL || '') ? process.env.CONTACT_EMAIL : '',
    facebook: /^https:\/\//.test(process.env.FACEBOOK_URL || '') ? process.env.FACEBOOK_URL : ''
  },
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN || '',
    phoneId: process.env.WHATSAPP_PHONE_ID || '',
    owner: process.env.OWNER_WHATSAPP || ''
  }
};
