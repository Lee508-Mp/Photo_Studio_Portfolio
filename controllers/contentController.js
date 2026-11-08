const content = require('../models/contentModel');

const MAX_SERVICES = 6;
// Keeps tabs and new lines, removes other invisible control characters
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);

exports.get = (req, res) => res.json(content.get());

exports.update = (req, res) => {
  const b = req.body || {};
  if (!Array.isArray(b.services) || b.services.length > MAX_SERVICES)
    return res.status(400).json({ error: `You can show up to ${MAX_SERVICES} services.` });

  const services = b.services.map(s => ({
    title: clean(s?.title, 60), description: clean(s?.description, 300),
    price: clean(s?.price, 40), category: clean(s?.category, 40)
  }));
  if (services.some(s => s.title.length < 2)) return res.status(400).json({ error: 'Every service needs a title.' });

  const about = { heading: clean(b.about?.heading, 100), body: clean(b.about?.body, 2000) };
  if (about.heading.length < 2) return res.status(400).json({ error: 'The About section needs a heading.' });

  content.save({ about, services });
  res.json(content.get());
};

exports.reset = (req, res) => { content.reset(); res.json(content.get()); };
