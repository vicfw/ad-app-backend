const express = require('express');
const {
  createAd,
  getAllAds,
  getSingleAdController,
  deleteAd,
} = require('../controller/adController');
const { protect } = require('../controller/authController');
const router = express.Router();

router.post('/create', protect, createAd);
router.get('/', protect, getAllAds);
router.get('/:id', getSingleAdController);

router.delete('/:id', protect, deleteAd);

module.exports = router;
