const db = require('../db/database');

const q = {
  all: db.prepare('SELECT id, title, category, src, layout FROM photos ORDER BY id DESC'),
  one: db.prepare('SELECT * FROM photos WHERE id = ?'),
  count: db.prepare('SELECT COUNT(*) AS n FROM photos'),
  insert: db.prepare('INSERT INTO photos (title, category, src, file, layout) VALUES (?, ?, ?, ?, ?)'),
  del: db.prepare('DELETE FROM photos WHERE id = ?')
};

exports.all = () => q.all.all();
exports.find = id => q.one.get(id);
exports.count = () => q.count.get().n;
exports.create = ({ title, category = '', src, file = null, layout = 'normal' }) => {
  const { lastInsertRowid } = q.insert.run(title, category, src, file, layout);
  return q.one.get(lastInsertRowid);
};
exports.remove = id => q.del.run(id).changes > 0;
