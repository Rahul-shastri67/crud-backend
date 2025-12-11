const express = require('express');
const router = express.Router();
const { usersByLocation } = require('../controllers/analyticsController');

router.get('/users-by-location', usersByLocation);

module.exports = router;
