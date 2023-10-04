const catchAsync = require("../utils/catchAsync");
const Ad = require("../models/adModel");
const FeatureAd = require("../models/featuredAd");
const Chat = require("../models/chatModel");
const AppError = require("../utils/appError");
const NotificationSender = require("../models/notificationSender");
const User = require("../models/userModel");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

exports.createAd = catchAsync(async (req, res, next) => {
  // todo:test trimmedBody
  // let trimmedBody;
  // for (let item in req.body) {
  //   trimmedBody = { ...item.trim() };
  // }
  const trimmedLowerCaseTitle = req.body.title.trim().toLowerCase();
  const ad = await Ad.create({
    ...req.body,
    title: trimmedLowerCaseTitle,
    creator: req.user._id,
  });

  res.status(201).json({ status: "success", ad });
});

exports.updateAd = catchAsync(async (req, res, next) => {
  const ad = await Ad.findByIdAndUpdate(
    { _id: req.params.id },
    { ...req.body, isApproved: false },
    { new: true, runValidators: true }
  );
  console.log(ad, "ad");
  res.status(201).json({ status: "success", ad });
});

exports.updateManyAds = catchAsync(async (req, res, next) => {
  const ad = await Ad.updateMany(
    { _id: req.body.ids },
    { ...req.body.property }
  );

  if (req.body.property.isApproved) {
    const notificationSender = await NotificationSender.find({});

    const ads = await Ad.find({
      _id: { $in: req.body.ids },
    });

    let userIds = [];

    ads.forEach((ad) => {
      notificationSender.forEach((notif) => {
        if (
          ad.category === notif.categoryId ||
          notif.maxYear < ad.year > notif.minYear ||
          ad.brand === notif.brand ||
          notif.maxKilometers < ad.kilometers > notif.minKilometers
        ) {
          userIds.push(notif.user);
        }
      });
    });

    if (userIds?.length) {
      const users = await User.find({
        _id: { $in: userIds },
      });

      users.forEach(async (user) => {
        const body = {
          to: user.notificationToken,
          title: "We found you a match ad for your notification",
        };

        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip,deflate",
            "Content-Type": "application/json",
          },
        });
      });
    }
  }

  if (ad.ok > 0) {
    res.status(201).json({ status: "success" });
  } else {
    res.status(400).json({ status: "fail" });
  }
});

exports.getAllAds = catchAsync(async (req, res, next) => {
  const {
    category,
    title,
    limit = 99999,
    page = 0,
    minPrice,
    maxPrice,
    minDate,
    maxDate,
    address,
    location,
    brand,
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
    isPopular,
  } = req.query;

  const filterObj = {};

  // Define filter conditions
  if (category) filterObj.category = category;
  if (title) filterObj.title = { $regex: title, $options: "i" };
  if (brand) filterObj.brand = brand;
  if (isApproved) filterObj.isApproved = true;
  if (isPopular) filterObj.isPopular = true;
  if (isNotApproved) filterObj.isApproved = false;
  if (minPrice) filterObj.price = { $gte: minPrice };
  if (maxPrice) filterObj.price = { ...filterObj.price, $lte: maxPrice };
  if (minPrice && maxPrice)
    filterObj.price = { $gte: minPrice, $lte: maxPrice };
  if (minDate) filterObj.year = { $gte: minDate };
  if (maxDate) filterObj.year = { ...filterObj.year, $lte: maxDate };
  if (minDate && maxDate) filterObj.year = { $gte: minDate, $lte: maxDate };
  if (address) filterObj.address = { $regex: address, $options: "i" };
  if (location) filterObj.location = { $regex: location, $options: "i" };
  if (condition) filterObj.condition = condition;
  if (saleBy) filterObj.saleBy = saleBy;
  if (minKilometers) filterObj.kilometers = { $gte: minKilometers };
  if (maxKilometers)
    filterObj.kilometers = { ...filterObj.kilometers, $lte: maxKilometers };
  if (transmission) filterObj.transmission = transmission;
  if (engineHP) filterObj.engineHP = { $regex: engineHP };
  if (engine) filterObj.engine = { $regex: engine };
  if (exteriorColor) filterObj.exteriorColor = { $regex: exteriorColor };
  if (differential) filterObj.differential = { $regex: differential };
  if (frontAxel) filterObj.frontAxel = { $regex: frontAxel };
  if (realAxel) filterObj.realAxel = { $regex: realAxel };
  if (suspension) filterObj.suspension = { $regex: suspension };
  if (wheelbase) filterObj.wheelbase = { $regex: wheelbase };
  if (wheels) filterObj.wheels = wheels;

  const adsQuery = Ad.find(filterObj)
    .populate({ path: "creator", populate: { path: "featuredAds" } })
    .populate("category")
    .sort({ createdAt: -1 });

  const skipCount = page > 1 ? (page - 1) * limit : 0;

  if (limit) adsQuery.limit(+limit);
  if (page) adsQuery.skip(skipCount);

  const [ads, totalCount] = await Promise.all([
    adsQuery.exec(),
    Ad.countDocuments(filterObj),
  ]);

  res
    .status(200)
    .json({ status: "success", totalCount, count: ads.length, ads });
});

exports.getSingleAdController = catchAsync(async (req, res) => {
  const _id = req.params.id;

  const ad = await Ad.findOne({ _id })
    .populate({
      path: "creator",
    })
    .populate("category");

  if (!ad) {
    return res.status(400).json({ status: "fail", message: "bad request" });
  }
  return res.status(200).json({ status: "success", ad });
});

exports.searchAdsController = catchAsync(async (req, res, next) => {
  const { query: title, limit, page } = req.query;

  const filterObj = {
    ...(title
      ? { title: { $regex: title, $options: "i" }, isApproved: true }
      : undefined),
  };

  if (!title) {
    return res.status(400).json({ message: "query string is empty" });
  }

  const totalCount = await Ad.countDocuments(filterObj);

  const ads = await Ad.find(filterObj)
    .sort({
      createdAt: -1,
    })
    .limit(limit ? +limit : 0)
    .skip(page === 1 ? +limit : +page * +limit);

  if (!ads?.length) {
    return res.status(400).json({ message: "no ad with this query" });
  }

  return res.status(200).json({
    status: "success",
    ads,
    count: ads.length,
    totalCount,
  });
});

exports.deleteAd = catchAsync(async (req, res, next) => {
  const doc = await Ad.findByIdAndDelete(req.params.id);

  await FeatureAd.findOneAndDelete({ ad: req.params.id });
  await Chat.findOneAndDelete({ ad: req.params.id });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  return res.status(204).json({
    status: "success",
    data: null,
  });
});
exports.deleteManyAds = catchAsync(async (req, res, next) => {
  const ad = await Ad.deleteMany({ _id: req.body });

  await Chat.deleteMany({ ad: req.body });
  await FeatureAd.deleteMany({ ad: req.body });

  if (ad.ok > 0 && ad.deletedCount > 0) {
    res.status(201).json({ status: "success" });
  } else {
    res.status(400).json({ status: "fail" });
  }
});
