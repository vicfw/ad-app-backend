const express = require('express');
const { protect } = require('../controller/authController');
const { allMessages, sendMessage } = require('../controller/messageController');

const router = express.Router();

router.route('/:chatId').get(protect, allMessages);
router.route('/').post(protect, sendMessage);

module.exports = router;
