const router = require('express').Router();
const rateLimit = require('../middleware/rateLimit');
const requireAdmin = require('../middleware/requireAdmin');
const upload = require('../middleware/upload');
const photo = require('../controllers/photoController');
const contact = require('../controllers/contactController');
const auth = require('../controllers/authController');
const enquiry = require('../controllers/enquiryController');
const site = require('../controllers/siteController');

router.get('/photos', photo.list);
router.get('/settings', site.settings);
router.post('/contact', rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }), contact.send);

router.post('/admin/login', rateLimit({ max: 10, windowMs: 15 * 60 * 1000 }), auth.login);
router.post('/admin/logout', auth.logout);
router.get('/admin/me', requireAdmin, auth.me);
router.post('/admin/photos', requireAdmin, upload, photo.create);
router.delete('/admin/photos/:id', requireAdmin, photo.remove);
router.get('/admin/enquiries', requireAdmin, enquiry.list);
router.delete('/admin/enquiries/:id', requireAdmin, enquiry.remove);

module.exports = router;
