const catchAsync = require('../utils/catchAsync');
const featuredAd = require('../models/featuredAd');
exports.createFeaturedAd = catchAsync(async (req, res, next) => {
  const featureAd = await featuredAd.create(req.body);

  res.status(201).json({ status: 'success', featureAd });
});
exports.featuredAdByUser = catchAsync(async (req, res, next) => {
  const featureAd = await featuredAd
    .find({ owner: req.user })
    .populate('ad')
    .select('-owner')
    .select('-__v');
  res.status(200).json({ status: 'success', featureAd });
});
