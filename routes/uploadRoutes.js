const express = require('express');
const { protect } = require('../controller/authController');
const router = express.Router();
const {
  categoryImage,
  adImage,
  profilePhoto,
} = require('../controller/uploadController');
const {
  upload,
  adImageUpload,
  profilePhotoUpload,
} = require('../utils/multerMidleware');

router.post('/categoryImage', protect, upload.single('image'), categoryImage);
router.post('/adImage', adImageUpload.single('image'), adImage);
router.post('/profilePhoto', profilePhotoUpload.single('image'), profilePhoto);

module.exports = router;
