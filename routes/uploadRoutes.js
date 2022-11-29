const express = require('express');
const router = express.Router();
const { categoryImage } = require('../controller/uploadController');
const { upload } = require('../utils/multerMidleware');

router.post('/categoryImage', upload.single('image'), categoryImage);

module.exports = router;
