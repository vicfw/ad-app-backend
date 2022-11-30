const express = require("express");
const router = express.Router();
const { categoryImage, adImage } = require("../controller/uploadController");
const { upload } = require("../utils/multerMidleware");

router.post("/categoryImage", upload.single("image"), categoryImage);
router.post("/adImage", upload.single("image"), adImage);

module.exports = router;
