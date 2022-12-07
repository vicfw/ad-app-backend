const catchAsync = require('../utils/catchAsync');
const FeaturedAd = require('../models/featuredAd');
const Ad = require('../models/adModel');

exports.createFeaturedAd = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const featureAd = await FeaturedAd.create(req.body);

  const ad = await Ad.findOne({ _id: req.body.ad });

  ad.featuredAd = featureAd._id;

  await ad.save();

  res.status(201).json({ status: 'success', featureAd });
});

exports.deleteFeaturedAd = catchAsync(async (req, res, next) => {
  await FeaturedAd.deleteOne({ _id: req.body.id });
  const ad = await Ad.findOne({ _id: req.body.ad });

  delete ad.featuredAd;

  await ad.save();

  res.status(200).json({ status: 'success' });
});

exports.featuredAdByUser = catchAsync(async (req, res, next) => {
  const featureAd = await FeaturedAd.find({ owner: req.user })
    .populate('ad')
    .select('-owner')
    .select('-__v');
  res.status(200).json({ status: 'success', featureAd });
});
