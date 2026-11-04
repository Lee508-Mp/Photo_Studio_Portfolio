const admins = require('../models/adminModel');
const passwords = require('../services/password');
const session = require('../services/session');

exports.login = (req, res) => {
  const { username, password } = req.body || {};
  const admin = admins.findByUsername(String(username || ''));
  const ok = passwords.verify(String(password || ''), admin ? admin.password_hash : passwords.DUMMY);
  if (!admin || !ok) return res.status(401).json({ error: 'Wrong username or password.' });
  res.setHeader('Set-Cookie', session.cookie(session.create(admin.username)));
  res.json({ ok: true });
};
exports.logout = (req, res) => {
  res.setHeader('Set-Cookie', session.cookie(''));
  res.json({ ok: true });
};
exports.me = (req, res) => res.json({ username: req.admin });
