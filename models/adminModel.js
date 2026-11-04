const db = require('../db/database');

const q = {
  byName: db.prepare('SELECT * FROM admins WHERE username = ?'),
  others: db.prepare('DELETE FROM admins WHERE username != ?'),
  upsert: db.prepare(`INSERT INTO admins (username, password_hash) VALUES (?, ?)
    ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash`)
};

exports.findByUsername = name => q.byName.get(name);
// Single-admin design: keep exactly one account, matching the .env values
exports.setOnlyAdmin = (username, hash) => { q.others.run(username); q.upsert.run(username, hash); };
