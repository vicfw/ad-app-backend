const express = require('express');
const { protect } = require('../controller/authController');
const {
  createNotificationSender,
  getNotificationSender,
} = require('../controller/notificationSenderController');

const router = express.Router();

router.route('/').get(protect, getNotificationSender);
router.route('/').post(protect, createNotificationSender);

module.exports = router;
