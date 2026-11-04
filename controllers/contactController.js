const whatsapp = require('../services/whatsapp');
const enquiries = require('../models/enquiryModel');

const clean = v => String(v || '').replace(/[\u0000-\u001f]/g, ' ').trim();

exports.send = async (req, res) => {
  const { name, contact, message, website } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot: hidden field only bots fill in

  const data = { name: clean(name).slice(0, 80), contact: clean(contact).slice(0, 80), message: clean(message).slice(0, 1000) };
  if (data.name.length < 2 || data.message.length < 5)
    return res.status(400).json({ error: 'Add your name and a short message.' });

  enquiries.create(data); // always saved, so you never lose an enquiry

  let waLink = whatsapp.link(data);
  if (whatsapp.canUseApi()) {
    try { await whatsapp.send(data); waLink = null; } // delivered automatically
    catch (e) { console.error(e.message); }             // fall back to the wa.me link
  }
  res.json({ ok: true, waLink });
};
