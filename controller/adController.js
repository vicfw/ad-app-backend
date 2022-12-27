const catchAsync = require("../utils/catchAsync");
const Ad = require("../models/adModel");
const FeatureAd = require("../models/featuredAd");
exports.createAd = catchAsync(async (req, res, next) => {
  const ad = await Ad.create({ ...req.body, creator: req.user._id });

  res.status(201).json({ status: "success", ad });
});

exports.updateAd = catchAsync(async (req, res, next) => {
  console.log(req.params, "req.params");
  console.log(req.body, "req.body");
  const ad = await Ad.findByIdAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    { new: true, runValidators: true }
  );

  console.log(ad, "ad after update");

  res.status(201).json({ status: "success", ad });
});

exports.getAllAds = catchAsync(async (req, res, next) => {
  const query = req.query;
  const ads = await Ad.find({})
    .populate({ path: "creator", populate: { path: "featuredAds" } })
    .limit(query?.limit ? +query.limit : 0)
    .skip(query?.page === 1 ? +query.limit : +query.page * +query.limit)
    .sort({ createdAt: -1 });

  const count = await Ad.estimatedDocumentCount();
  res.status(201).json({ status: "success", count, ads });
});

exports.getSingleAdController = catchAsync(async (req, res) => {
  const _id = req.params.id;

  console.log(req.params, "params");

  const ad = await Ad.findOne({ _id });

  console.log(ad);

  if (!ad) {
    return res.status(400).json({ status: "fail", message: "bad request" });
  }
  return res.status(200).json({ status: "success", ad });
});

exports.deleteAd = catchAsync(async (req, res, next) => {
  const doc = await Ad.findByIdAndDelete(req.params.id);

  await FeatureAd.findOneAndDelete({ ad: req.params.id });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  console.log(doc, "doc");

  return res.status(204).json({
    status: "success",
    data: null,
  });
});
