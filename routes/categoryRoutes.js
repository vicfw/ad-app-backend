const express = require('express');
const router = express.Router();
const {
  createCategory,
  getallCategories,
  updateCategories,
  deleteCategories,
  getallCategoriesWithoutChildren,
} = require('../controller/category.controller');
const { protect } = require('../controller/authController');

router.get('/', getallCategories);
router.get('/getallCategoriesWithoutChildren', getallCategoriesWithoutChildren);
router.post('/create', protect, createCategory);
router.post('/update', protect, updateCategories);
router.post('/delete', deleteCategories);

module.exports = router;
