const mongoose = require("mongoose");

const forgetPasswordToken = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    token: { type: String, required: true },
    passwordChangedAt: Date,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ForgetPasswordToken", forgetPasswordToken);
