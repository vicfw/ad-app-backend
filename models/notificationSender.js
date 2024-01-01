const mongoose = require("mongoose");

const notificationSender = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: String,
      trim: true,
    },
    minKilometers: {
      type: Number,
      trim: true,
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Minimum kilometers should be a positive number.",
      },
    },
    maxKilometers: {
      type: Number,
      trim: true,
      validate: function (value) {
        if (parseInt(value) <= parseInt(this.minKilometers)) {
          throw new Error(
            "Maximum kilometers should be greater than or equal to minimum kilometers."
          );
        }
      },
    },
    minYear: {
      type: Number,
      trim: true,
      validate: {
        validator: function (value) {
          return value >= 1900;
        },
        message: "Minimum year should be greater than or equal to 1900.",
      },
    },
    maxYear: {
      type: Number,
      trim: true,
      validate: function (value) {
        if (value <= this.minYear) {
          throw new Error(
            "Maximum year should be greater than or equal to minimum year."
          );
        }
      },
    },
  },
  { timestamps: true }
);

const NotificationSender = mongoose.model(
  "NotificationSender",
  notificationSender
);

module.exports = NotificationSender;
