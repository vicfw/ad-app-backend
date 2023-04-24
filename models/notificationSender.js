const mongoose = require('mongoose');

const notificationSender = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    brand: String,
    kilometers: Number,
    year: Number,
  },
  { timestamps: true }
);

const NotificationSender = mongoose.model(
  'NotificationSender',
  notificationSender
);

module.exports = NotificationSender;
