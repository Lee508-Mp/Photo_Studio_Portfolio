const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { uploadDir } = require('../config');

fs.mkdirSync(uploadDir, { recursive: true });
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    // Random name: we never trust the visitor's file name
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + EXT[file.mimetype])
  }),
  limits: { fileSize: 18 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    EXT[file.mimetype] ? cb(null, true) : cb(new Error('Only JPG, PNG or WebP images are allowed.'))
});

module.exports = (req, res, next) =>
  upload.single('photo')(req, res, err => {
    if (!err) return next();
    res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 18 MB).' : err.message });
  });
