const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET all news
router.get('/', newsController.getAllNews);

// GET trending/latest verified news
router.get('/verified', newsController.getVerifiedNews);

// POST verify a manually submitted news text or url
router.post('/verify', newsController.verifyManualNews);

module.exports = router;
