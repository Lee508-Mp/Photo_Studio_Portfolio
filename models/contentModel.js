const db = require('../db/database');
const defaults = require('../db/defaultContent');

db.exec('CREATE TABLE IF NOT EXISTS site_content (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
const q = {
  get: db.prepare("SELECT value FROM site_content WHERE key = 'content'"),
  set: db.prepare(`INSERT INTO site_content (key, value) VALUES ('content', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value`),
  del: db.prepare("DELETE FROM site_content WHERE key = 'content'")
};

exports.get = () => {
  const row = q.get.get();
  if (!row) return defaults;
  try { return JSON.parse(row.value); } catch { return defaults; }
};
exports.save = content => q.set.run(JSON.stringify(content));
exports.reset = () => q.del.run();
