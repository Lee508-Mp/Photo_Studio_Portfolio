const enquiries = require('../models/enquiryModel');

exports.list = (req, res) => res.json(enquiries.all());
exports.remove = (req, res) =>
  enquiries.remove(Number(req.params.id)) ? res.json({ ok: true }) : res.status(404).json({ error: 'Not found.' });
