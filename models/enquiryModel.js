const db = require('../db/database');

const q = {
  all: db.prepare('SELECT * FROM enquiries ORDER BY id DESC LIMIT 200'),
  insert: db.prepare('INSERT INTO enquiries (name, contact, message) VALUES (?, ?, ?)'),
  del: db.prepare('DELETE FROM enquiries WHERE id = ?')
};
exports.all = () => q.all.all();
exports.create = ({ name, contact, message }) => q.insert.run(name, contact, message);
exports.remove = id => q.del.run(id).changes > 0;
