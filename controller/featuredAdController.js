const catchAsync = require('../utils/catchAsync');
const FeaturedAd = require('../models/featuredAd');

exports.createFeaturedAd = catchAsync(async (req, res, next) => {
  const featureAd = await FeaturedAd.create({
    ...req.body,
    owner: req.user._id,
  });

  res.status(201).json({ status: 'success', featureAd });
});

exports.deleteFeaturedAd = catchAsync(async (req, res, next) => {
  console.log(req.body);

  await FeaturedAd.findByIdAndDelete({ _id: req.body.featuredAdId });

  res.status(200).json({ status: 'success' });
});

exports.featuredAdByUser = catchAsync(async (req, res, next) => {
  const featureAd = await FeaturedAd.find({ owner: req.user })
    .populate('ad')
    .select('-owner')
    .select('-__v');
  res.status(200).json({ status: 'success', featureAd });
});
