const catchAsync = require('../utils/catchAsync');
const Ad = require('../models/adModel');
exports.createAd = catchAsync(async (req, res, next) => {
  const ad = await Ad.create(req.body);

  res.status(201).json({ status: 'success', ad });
});

exports.getAllAds = catchAsync(async (req, res, next) => {
  console.log('here');
  const query = req.query;
  const ads = await Ad.find({})
    .populate('featuredAd')
    .limit(query?.limit ? +query.limit : 9999)
    .skip(query?.page === 1 ? +query.limit : +query.page * +query.limit)
    .sort({ createdAt: -1 });

  const count = await Ad.estimatedDocumentCount();
  res.status(201).json({ status: 'success', count, ads });
});
