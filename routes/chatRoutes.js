const express = require('express');
const { protect } = require('../controller/authController');
const { accessChat, fetchChats, deleteChat } = require('../controller/chatController');

const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/:id').delete(protect, deleteChat);

module.exports = router;
