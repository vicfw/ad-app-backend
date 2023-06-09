const express = require("express");
const router = express.Router();
const {
  createCategory,
  getallCategories,
  updateCategories,
  deleteCategories,
  getallCategoriesWithoutChildren,
  getLastFourCategories,
} = require("../controller/category.controller");
const { protect, restrictTo } = require("../controller/authController");

router.get("/", getallCategories);
router.get("/getallCategoriesWithoutChildren", getallCategoriesWithoutChildren);
router.get("/lastFour", getLastFourCategories);

router.post("/create", protect, createCategory);
router.post("/update", protect, updateCategories);
router.post("/delete", protect, restrictTo("admin"), deleteCategories);

module.exports = router;
