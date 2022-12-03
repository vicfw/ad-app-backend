const catchAsync = require('../utils/catchAsync');
const Ad = require('../models/adModel');
exports.createAd = catchAsync(async (req, res, next) => {
  const ad = await Ad.create(req.body);

  res.status(201).json({ status: 'success', ad });
});
