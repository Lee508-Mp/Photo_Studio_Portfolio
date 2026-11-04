const session = require('../services/session');

module.exports = (req, res, next) => {
  const data = session.read(session.fromRequest(req));
  if (!data) return res.status(401).json({ error: 'Please log in.' });
  req.admin = data.u;
  next();
};
