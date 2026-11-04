module.exports = ({ max, windowMs }) => {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    if (hits.size > 5000) hits.clear(); // crude memory guard
    const recent = (hits.get(req.ip) || []).filter(t => now - t < windowMs);
    recent.push(now);
    hits.set(req.ip, recent);
    if (recent.length > max) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    next();
  };
};
