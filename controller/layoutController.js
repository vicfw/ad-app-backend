const catchAsync = require("../utils/catchAsync");
const Layout = require("../models/layoutModel");

const types = ["webapp", "mobile"];

exports.getBanner = catchAsync(async (req, res, next) => {
  const banner = await Layout.findOne({});
  if (!banner) {
    return res.status(500).json({ status: "fail" });
  }

  return res.status(201).json({ status: "success", data: banner });
});

exports.createBanner = catchAsync(async (req, res, next) => {
  const { image, link } = req.body;
  const { type } = req.query;

  if (!types.includes(type)) {
    return res
      .status(400)
      .json({ status: "fail", message: "please use right queries" });
  }

  const getBanner = await Layout.findOne({});

  if (getBanner) {
    if (type === "webapp") {
      image ? (getBanner.websiteBanner = image) : null;
      link ? (getBanner.websiteBannerLink = link) : null;
    } else {
      image ? (getBanner.mobileBanner = image) : null;
      link ? (getBanner.mobileBannerLink = link) : null;
    }

    getBanner.save();
    return res.status(200).json({ status: "success", getBanner });
  }

  const banner = await Layout.create(
    type === "webapp"
      ? { websiteBanner: image, websiteBannerLink: link }
      : { mobileBanner: image, mobileBannerLink: link }
  );

  if (!banner) {
    return res.status(500).json({ status: "fail" });
  }

  return res.status(201).json({ status: "success", data: banner });
});
