const express = require('express');
const { protect } = require('../controller/authController');
const {
  createFeaturedAd,
  featuredAdByUser,
  deleteFeaturedAd,
} = require('../controller/featuredAdController');
const router = express.Router();

router.post('/create', protect, createFeaturedAd);
router.get('/featuredAdByUser', protect, featuredAdByUser);
router.delete('/', protect, deleteFeaturedAd);

module.exports = router;
