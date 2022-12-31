const express = require('express');
const { protect } = require('../controller/authController');
const { createRoom } = require('../controller/roomController');
const router = express.Router();

router.post('/', protect, createRoom);
// router.get('/featuredAdByUser', protect, featuredAdByUser);
// router.delete('/', protect, deleteFeaturedAd);

module.exports = router;
