const express = require("express");
const router = express.Router();
const { categoryImage, adImage } = require("../controller/uploadController");
const { upload, adImageUpload } = require("../utils/multerMidleware");

router.post("/categoryImage", upload.single("image"), categoryImage);
router.post("/adImage", adImageUpload.single("image"), adImage);

module.exports = router;
