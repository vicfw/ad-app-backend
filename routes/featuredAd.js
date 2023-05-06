const express = require('express');
const { protect } = require('../controller/authController');
const {
  createFeaturedAd,
  featuredAdByUser,
  deleteFeaturedAd,
  featuredAdByUserAndAd,
} = require('../controller/featuredAdController');
const router = express.Router();

router.post('/create', protect, createFeaturedAd);
router.get('/featuredAdByUser', protect, featuredAdByUser);
router.get('/featuredAdByUserAndAd', protect, featuredAdByUserAndAd);
router.delete('/:id', protect, deleteFeaturedAd);

module.exports = router;
