const express = require("express");
const {
  createAd,
  getAllAds,
  getSingleAdController,
  deleteAd,
  updateAd,
  searchAdsContorller,
} = require("../controller/adController");
const { protect } = require("../controller/authController");
const router = express.Router();

router.post("/create", protect, createAd);
router.get("/search", searchAdsContorller);
router.get("/", protect, getAllAds);
router.patch("/:id", protect, updateAd);
router.get("/:id", getSingleAdController);
router.delete("/:id", protect, deleteAd);

module.exports = router;
