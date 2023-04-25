const mongoose = require('mongoose');

const notificationSender = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    brand: {
      type: String,
      trim: true,
    },
    kilometers: {
      type: Number,
      trim: true,
    },
    year: {
      type: Number,
      trim: true,
    },
  },
  { timestamps: true }
);

const NotificationSender = mongoose.model(
  'NotificationSender',
  notificationSender
);

module.exports = NotificationSender;
