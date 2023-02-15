const express = require('express');
const {
  createAd,
  getAllAds,
  getSingleAdController,
  deleteAd,
  updateAd,
  searchAdsController,
  updateManyAds,
  deleteManyAds,
} = require('../controller/adController');
const { protect } = require('../controller/authController');
const router = express.Router();

router.post('/create', protect, createAd);
router.get('/search', searchAdsController);
router.get('/', protect, getAllAds);
router.patch('/', protect, updateManyAds);
router.patch('/:id', protect, updateAd);
router.get('/:id', getSingleAdController);
router.delete('/', protect, deleteManyAds);
router.delete('/:id', protect, deleteAd);

module.exports = router;
