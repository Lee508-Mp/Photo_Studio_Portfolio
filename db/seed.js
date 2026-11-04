const fs = require('fs');
const path = require('path');
const photos = require('../models/photoModel');
const admins = require('../models/adminModel');
const passwords = require('../services/password');
const { admin, root } = require('../config');

// Put the files in public/images/gallery/ and name them <slug>-<number>.jpg
const EXT = '.jpeg';
const GROUPS = [
  { category: 'Special Moments', slug: 'special-moments', count: 5 },
  { category: 'Studio', slug: 'studio', count: 3 },
  { category: 'Outdoors', slug: 'outdoors', count: 2 },
  { category: 'Events', slug: 'events', count: 2 },
  { category: 'Mulungushi', slug: 'mulungushi', count: 1 },
  { category: 'Portrait', slug: 'portrait', count: 1 }
];
// Optional: a different grid shape ('tall' or 'wide'), e.g. { 'portrait-1': 'tall' }
const LAYOUTS = {};

const list = GROUPS.flatMap(({ category, slug, count }) =>
  Array.from({ length: count }, (_, i) => {
    const name = `${slug}-${i + 1}`;
    return {
      title: count > 1 ? `${category} ${i + 1}` : category,
      category,
      layout: LAYOUTS[name] || 'normal',
      src: `/images/gallery/${name}${EXT}`
    };
  }));

exports.seedPhotos = () => {
  if (photos.count() > 0) return; // only fills an empty gallery
  for (const p of list) {
    if (!fs.existsSync(path.join(root, 'public', p.src))) console.warn(`Missing photo file: public${p.src}`);
  }
  [...list].reverse().forEach(p => photos.create(p)); // reversed so the first one listed shows first
};
exports.syncAdmin = () => {
  if (!admin.username || admin.password.length < 10) {
    console.warn('Admin not set: add ADMIN_USERNAME and a 10+ character ADMIN_PASSWORD to .env');
    return;
  }
  admins.setOnlyAdmin(admin.username, passwords.hash(admin.password));
};
