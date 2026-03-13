const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// Map Route - Could be public, or restricted. Making it public for easy consumption by front page maps
router.get('/city/:city_id', mapController.getMapDataByCity);

module.exports = router;
