const { whatsapp } = require('../config');

// Mode A (free, no Meta account): a wa.me link that opens WhatsApp with the message ready
exports.link = ({ name, contact, message }) => {
  const to = whatsapp.owner.replace(/\D/g, '');
  if (!to) return null;
  const text = `Hi, I'm ${name}${contact ? ` (${contact})` : ''}.\n\n${message}`;
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
};

// Mode B (optional): automatic delivery through Meta's Cloud API
exports.canUseApi = () => Boolean(whatsapp.token && whatsapp.phoneId && whatsapp.owner);
exports.send = async ({ name, contact, message }) => {
  const res = await fetch(`https://graph.facebook.com/v21.0/${whatsapp.phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${whatsapp.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to: whatsapp.owner.replace(/\D/g, ''), type: 'text',
      text: { body: `New enquiry\nName: ${name}\nContact: ${contact || 'not given'}\n\n${message}` }
    })
  });
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${await res.text()}`);
};
