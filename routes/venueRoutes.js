const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');

router.get('/venues', venueController.getVenues);

module.exports = router;