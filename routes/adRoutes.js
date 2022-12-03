const express = require('express');
const { createAd } = require('../controller/adController');
const { protect } = require('../controller/authController');
const router = express.Router();

router.post('/create', protect, createAd);

module.exports = router;
