const Message = require('../models/messageModel');

const catchAsync = require('../utils/catchAsync');
const NotificationSender = require('../models/notificationSender');

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
exports.getNotificationSender = catchAsync(async (req, res) => {});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected

exports.createNotificationSender = catchAsync(async (req, res) => {
  const message = await NotificationSender.create(req.body);

  res.status(200).json({ status: 'success', message });
});
