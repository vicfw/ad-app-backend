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
  profilePhotoUpload,
  bannerImageUpload,
} = require("../utils/multerMidleware");
const multer = require("multer");

const uploadAdImage = multer({ dest: "tmp/" });

router.post("/categoryImage", protect, upload.single("image"), categoryImage);
router.post("/adImage", uploadAdImage.array("images"), adImage);
router.post("/profilePhoto", profilePhotoUpload.single("image"), profilePhoto);
router.post("/banner", bannerImageUpload.single("image"), bannerPhoto);

module.exports = router;
