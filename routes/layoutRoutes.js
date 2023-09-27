const express = require("express");
const router = express.Router();

const { protect, restrictTo } = require("../controller/authController");
const { createBanner, getBanner } = require("../controller/layoutController");

router.post("/banner", protect, restrictTo("admin"), createBanner);
router.get("/banner", protect, restrictTo("admin"), getBanner);

module.exports = router;
