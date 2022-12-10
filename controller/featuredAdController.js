const catchAsync = require('../utils/catchAsync');
const FeaturedAd = require('../models/featuredAd');
const Ad = require('../models/adModel');
const User = require('../models/userModel');

exports.createFeaturedAd = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const featureAd = await FeaturedAd.create({
    ...req.body,
    owner: req.user._id,
  });

  const ad = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { $push: { featuredAds: featureAd._id } }
  );

  res.status(201).json({ status: 'success', featureAd });
});

exports.deleteFeaturedAd = catchAsync(async (req, res, next) => {
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
