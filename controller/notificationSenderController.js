const Message = require('../models/messageModel');

const catchAsync = require('../utils/catchAsync');
const NotificationSender = require('../models/notificationSender');

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
exports.getNotificationSender = catchAsync(async (req, res) => {
  const notificationsForSend = await NotificationSender.findOne({
    user: req.user,
  });
  res.status(200).json({ status: 'success', data: notificationsForSend });
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected

exports.createNotificationSender = catchAsync(async (req, res) => {
  const notificationSenderIsExist = await NotificationSender.findOne({
    user: req.user,
  });
  if (notificationSenderIsExist) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'you have an instance already' });
  }
  const notificationSender = await NotificationSender.create({
    user: req.user,
    ...req.body,
  });

  res.status(200).json({ status: 'success', data: notificationSender });
});
exports.deleteNotificationSender = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NotificationSender.findOneAndDelete(id);

  res.status(200).json({ status: 'success' });
});

exports.updateNotificationSender = catchAsync(async (req, res, next) => {
  const notificationSender = await NotificationSender.findByIdAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(201).json({ status: 'success', data: notificationSender });
});
