const express = require('express');
const path = require('path');
const config = require('./config');
const { seedPhotos, syncAdmin } = require('./db/seed');

exports.createApp = () => {
  seedPhotos();
  syncAdmin();

  const app = express();
  app.disable('x-powered-by');
  if (config.isProd) app.set('trust proxy', 1); // Render sits behind a proxy

  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    });
    next();
  });
  app.use(express.json({ limit: '10kb' }));
  app.use('/uploads', express.static(config.uploadDir));
  app.use(express.static(path.join(config.root, 'public')));
  app.use('/api', require('./routes'));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));
  app.use((err, req, res, next) => { // last-resort error handler
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  });
  return app;
};
