const catchAsync = require('../utils/catchAsync');
const Ad = require('../models/adModel');
const FeatureAd = require('../models/featuredAd');
exports.createAd = catchAsync(async (req, res, next) => {
  // todo:test trimmedBody
  // let trimmedBody;
  // for (let item in req.body) {
  //   trimmedBody = { ...item.trim() };
  // }
  const ad = await Ad.create({ ...req.body, creator: req.user._id });

  res.status(201).json({ status: 'success', ad });
});

exports.updateAd = catchAsync(async (req, res, next) => {
  console.log(req.params, 'req.params');
  console.log(req.body, 'req.body');
  const ad = await Ad.findByIdAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    { new: true, runValidators: true }
  );

  console.log(ad, 'ad after update');

  res.status(201).json({ status: 'success', ad });
});

exports.getAllAds = catchAsync(async (req, res, next) => {
  const {
    category,
    limit,
    page,
    minPrice,
    maxPrice,
    address,
    location,
    condition,
    saleBy,
    minKilometers,
    maxKilometers,
    transmission,
    engineHP,
    engine,
    exteriorColor,
    differential,
    frontAxel,
    realAxel,
    suspension,
    wheelbase,
    wheels,
  } = req.query;

  console.log(req.query, 'req.query');

  const filterObj = {
    ...(category ? { category } : undefined),
    ...(minPrice ? { price: { $gte: minPrice } } : undefined),
    ...(maxPrice ? { price: { $lte: maxPrice } } : undefined),
    ...(address ? { address: { $regex: address } } : undefined),
    ...(location ? { location } : undefined),
    ...(condition ? { condition } : undefined),
    ...(saleBy ? { saleBy } : undefined),
    ...(minKilometers ? { kilometers: { $gte: minKilometers } } : undefined),
    ...(maxKilometers ? { kilometers: { $lte: maxKilometers } } : undefined),
    ...(transmission ? { transmission } : undefined),
    ...(engineHP ? { engineHP: { $regex: engineHP } } : undefined),
    ...(engine ? { engine: { $regex: engine } } : undefined),
    ...(exteriorColor
      ? { exteriorColor: { $regex: exteriorColor } }
      : undefined),
    ...(differential ? { differential: { $regex: differential } } : undefined),
    ...(frontAxel ? { frontAxel: { $regex: frontAxel } } : undefined),
    ...(realAxel ? { realAxel: { $regex: realAxel } } : undefined),
    ...(suspension ? { suspension: { $regex: suspension } } : undefined),
    ...(wheelbase ? { wheelbase: { $regex: wheelbase } } : undefined),
    ...(wheels ? { wheels } : undefined),
  };

  const ads = await Ad.find(filterObj)
    .populate({ path: 'creator', populate: { path: 'featuredAds' } })
    .limit(limit ? +limit : 0)
    .skip(page === 1 ? +limit : +page * +limit)
    .sort({ createdAt: -1 });

  const totalCount = await Ad.find(filterObj).countDocuments();
  res
    .status(200)
    .json({ status: 'success', totalCount, count: ads.length, ads });
});

exports.getSingleAdController = catchAsync(async (req, res) => {
  const _id = req.params.id;

  const ad = await Ad.findOne({ _id }).populate({
    path: 'creator',
  });

  if (!ad) {
    return res.status(400).json({ status: 'fail', message: 'bad request' });
  }
  return res.status(200).json({ status: 'success', ad });
});

exports.deleteAd = catchAsync(async (req, res, next) => {
  const doc = await Ad.findByIdAndDelete(req.params.id);

  await FeatureAd.findOneAndDelete({ ad: req.params.id });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  console.log(doc, 'doc');

  return res.status(204).json({
    status: 'success',
    data: null,
  });
});
