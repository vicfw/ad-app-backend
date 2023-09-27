const express = require("express");
const { protect } = require("../controller/authController");
const router = express.Router();
const {
  categoryImage,
  adImage,
  profilePhoto,
  bannerPhoto,
} = require("../controller/uploadController");
const {
  upload,
  adImageUpload,
  profilePhotoUpload,
  bannerImageUpload,
} = require("../utils/multerMidleware");

router.post("/categoryImage", protect, upload.single("image"), categoryImage);
router.post("/adImage", adImageUpload.single("image"), adImage);
router.post("/profilePhoto", profilePhotoUpload.single("image"), profilePhoto);
router.post("/banner", bannerImageUpload.single("image"), bannerPhoto);

module.exports = router;
