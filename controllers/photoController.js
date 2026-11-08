const fs = require('fs');
const path = require('path');
const photos = require('../models/photoModel');
const { uploadDir } = require('../config');

const LAYOUTS = ['normal', 'tall', 'wide'];

// Check the real file bytes, not just the name or declared type
function looksLikeImage(file) {
  const fd = fs.openSync(file, 'r');
  const b = Buffer.alloc(12);
  fs.readSync(fd, b, 0, 12, 0);
  fs.closeSync(fd);
  const jpg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const webp = b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP';
  return jpg || png || webp;
}

exports.list = (req, res) => res.json(photos.all());

exports.create = (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ error: 'Choose an image to upload.' });
  const fail = msg => { fs.rmSync(f.path,{ force: true }); return res.status(400).json({ error: msg }); };

  const title = String(req.body.title || '').trim().slice(0, 80);
  const category = String(req.body.category || '').trim().slice(0, 40);
  const layout = LAYOUTS.includes(req.body.layout) ? req.body.layout : 'normal';
  if (title.length < 2) return fail('Add a title (at least 2 characters).');
  if (!looksLikeImage(f.path)) return fail('That file is not a valid JPG, PNG or WebP image.');

  res.status(201).json(photos.create({ title, category, layout, src: `/uploads/${f.filename}`, file: f.filename }));
};

exports.remove = (req, res) => {
  const photo = photos.find(Number(req.params.id));
  if (!photo) return res.status(404).json({ error: 'Photo not found.' });
  photos.remove(photo.id);
  if (photo.file) fs.unlink(path.join(uploadDir, path.basename(photo.file)), () => {});
  res.json({ ok: true });
};
