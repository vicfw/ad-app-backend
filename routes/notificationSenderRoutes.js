const express = require('express');
const { protect } = require('../controller/authController');
const {
  createNotificationSender,
  getNotificationSender,
  deleteNotificationSender,
  updateNotificationSender,
} = require('../controller/notificationSenderController');

const router = express.Router();

router.route('/').get(protect, getNotificationSender);
router.route('/').post(protect, createNotificationSender);
router.route('/:id').delete(protect, deleteNotificationSender);
router.route('/:id').patch(protect, updateNotificationSender);

module.exports = router;
