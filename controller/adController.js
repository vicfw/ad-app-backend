const catchAsync = require('../utils/catchAsync');
const Ad = require('../models/adModel');
exports.createAd = catchAsync(async (req, res, next) => {
  const ad = await Ad.create({ ...req.body, creator: req.user._id });

  res.status(201).json({ status: 'success', ad });
});

exports.getAllAds = catchAsync(async (req, res, next) => {
  const query = req.query;
  const ads = await Ad.find({})
    .populate({ path: 'creator', populate: { path: 'featuredAds' } })
    .limit(query?.limit ? +query.limit : 9999)
    .skip(query?.page === 1 ? +query.limit : +query.page * +query.limit)
    .sort({ createdAt: -1 });

  const count = await Ad.estimatedDocumentCount();
  res.status(201).json({ status: 'success', count, ads });
});

exports.getSingleAdController = catchAsync(async (req, res) => {
  const _id = req.params.id;

  console.log(req.params);

  const ad = await Ad.findOne({ _id });

  if (!ad) {
    res.status(400).json({ status: 'fail', message: 'bad request' });
  }
  res.status(200).json({ status: 'success', ad });
});
