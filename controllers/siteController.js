const { site } = require('../config');

// Public contact details for the page. Everything here is shown to visitors anyway.
exports.settings = (req, res) => res.json(site);
