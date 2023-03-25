const catchAsync = require('../utils/catchAsync');
const Ad = require('../models/adModel');
const FeatureAd = require('../models/featuredAd');
const Chat = require('../models/chatModel');
const AppError = require('../utils/appError');
exports.createAd = catchAsync(async (req, res, next) => {
  // todo:test trimmedBody
  // let trimmedBody;
  // for (let item in req.body) {
  //   trimmedBody = { ...item.trim() };
  // }
  const lowerCaseTitle = req.body.title.toLowerCase();
  const ad = await Ad.create({
    ...req.body,
    title: lowerCaseTitle,
    creator: req.user._id,
  });

  res.status(201).json({ status: 'success', ad });
});

exports.updateAd = catchAsync(async (req, res, next) => {
  const ad = await Ad.findByIdAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(201).json({ status: 'success', ad });
});

exports.updateManyAds = catchAsync(async (req, res, next) => {
  const ad = await Ad.updateMany(
    { _id: req.body.ids },
    { ...req.body.property }
  );

  if (ad.ok > 0) {
    res.status(201).json({ status: 'success' });
  } else {
    res.status(400).json({ status: 'fail' });
  }
});

exports.getAllAds = catchAsync(async (req, res, next) => {
  const {
    category,
    title,
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
    isApproved,
    isNotApproved,
  } = req.query;

  console.log(req.query);

  const filterObj = {
    ...(category ? { category } : undefined),
    ...(title ? { title } : undefined),
    ...(isApproved ? { isApproved: true } : undefined),
    ...(isNotApproved ? { isApproved: false } : undefined),
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

  console.log(filterObj, 'filterObj');

  const ads = await Ad.find(filterObj)
    .populate({ path: 'creator', populate: { path: 'featuredAds' } })
    .populate('category')
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

  const ad = await Ad.findOne({ _id })
    .populate({
      path: 'creator',
    })
    .populate('category');

  if (!ad) {
    return res.status(400).json({ status: 'fail', message: 'bad request' });
  }
  return res.status(200).json({ status: 'success', ad });
});

exports.searchAdsController = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  const lowerCaseQuery = query?.toLowerCase();

  if (!lowerCaseQuery) {
    return res.status(400).json({ message: 'query string is empty' });
  }

  const ads = await Ad.find({ $text: { $search: lowerCaseQuery } })
    .sort({
      createdAt: -1,
    })
    .limit(10);

  if (!ads?.length) {
    return res.status(400).json({ message: 'no ad with this query' });
  }

  return res.status(200).json({
    status: 'success',
    ads,
    count: ads.length,
    totalCount: ads.length,
  });
});

exports.deleteAd = catchAsync(async (req, res, next) => {
  const doc = await Ad.findByIdAndDelete(req.params.id);

  await FeatureAd.findOneAndDelete({ ad: req.params.id });
  await Chat.findOneAndDelete({ ad: req.params.id });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  return res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.deleteManyAds = catchAsync(async (req, res, next) => {
  const ad = await Ad.deleteMany({ _id: req.body });

  if (ad.ok > 0 && ad.deletedCount > 0) {
    res.status(201).json({ status: 'success' });
  } else {
    res.status(400).json({ status: 'fail' });
  }
});
