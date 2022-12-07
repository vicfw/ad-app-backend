const express = require('express');
const { createAd, getAllAds } = require('../controller/adController');
const { protect } = require('../controller/authController');
const router = express.Router();

router.post('/create', protect, createAd);
router.get('/', protect, getAllAds);

module.exports = router;
