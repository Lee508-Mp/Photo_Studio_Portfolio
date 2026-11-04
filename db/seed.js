const photos = require('../models/photoModel');
const admins = require('../models/adminModel');
const passwords = require('../services/password');
const { admin } = require('../config');

const samples = [
  ['Wedding', 'Commercial', 'zl1', 800, 1100, 'tall'],
  ['Landscape', 'Special Moments', 'zl2', 800, 600, 'normal'],
  ['Street', 'Mulungushi', 'zl3', 800, 600, 'normal'],
  ['Family portrait', 'Outdoors', 'zl4', 1200, 600, 'wide'],
  ['Studio portrait', 'Studio', 'zl5', 800, 1100, 'tall'],
  ['Event coverage', 'Events', 'zl6', 800, 600, 'normal'],
  ['Product', 'Designs', 'zl7', 800, 600, 'normal']
];

exports.seedPhotos = () => {
  if (photos.count() > 0) return;
  [...samples].reverse().forEach(([title, category, seed, w, h, layout]) =>
    photos.create({ title, category, layout, src: `https://picsum.photos/seed/${seed}/${w}/${h}` }));
};

exports.syncAdmin = () => {
  if (!admin.username || admin.password.length < 10) {
    console.warn('Admin not set: add ADMIN_USERNAME and a 10+ character ADMIN_PASSWORD to .env');
    return;
  }
  admins.setOnlyAdmin(admin.username, passwords.hash(admin.password));
};
