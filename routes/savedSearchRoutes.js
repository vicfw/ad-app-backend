const express = require("express");
const { protect } = require("../controller/authController");
const {
  createSavedSearch,
  getSavedSearch,
  deleteSavedSearch,
} = require("../controller/savedSearchController");
const router = express.Router();

router.route("/").get(protect, getSavedSearch).post(protect, createSavedSearch);

router.delete("/:id", protect, deleteSavedSearch);

module.exports = router;
