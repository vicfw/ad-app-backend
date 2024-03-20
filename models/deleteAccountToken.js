const mongoose = require("mongoose");

const deleteAccountToken = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    token: { type: String, required: true },
    deleteAccountExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeleteAccountToken", deleteAccountToken);
