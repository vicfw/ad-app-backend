const mongoose = require("mongoose");

const layout = mongoose.Schema(
  {
    websiteBanner: {
      type: String,
    },
    websiteBannerLink: String,
    mobileBanner: {
      type: String,
    },
    mobileBannerLink: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Layout", layout);
