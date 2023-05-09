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
  const lowerCaseTitle = req.body.title.toLowerCase();
  const ad = await Ad.create({
    ...req.body,
    title: lowerCaseTitle,
    creator: req.user._id,
  });

  res.status(201).json({ status: "success", ad });
});

exports.updateAd = catchAsync(async (req, res, next) => {
  const ad = await Ad.findByIdAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    { new: true, runValidators: true }
  );

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

    if (!userIds.length) {
      return;
    }

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
    isPopular,
  } = req.query;

  const filterObj = {
    ...(category ? { category } : undefined),
    ...(title ? { title: { $regex: title, $options: "i" } } : undefined),
    ...(isApproved ? { isApproved: true } : undefined),
    ...(isPopular ? { isPopular: true } : undefined),
    ...(isNotApproved ? { isApproved: false } : undefined),
    ...(minPrice ? { price: { $gte: minPrice } } : undefined),
    ...(maxPrice ? { price: { $lte: maxPrice } } : undefined),
    ...(address ? { address: { $regex: address, $options: "i" } } : undefined),
    ...(location
      ? { location: { $regex: location, $options: "i" } }
      : undefined),
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
    .populate({ path: "creator", populate: { path: "featuredAds" } })
    .populate("category")
    .limit(limit ? +limit : 0)
    .skip(page === 1 ? +limit : +page * +limit)
    .sort({ createdAt: -1 });

  const totalCount = await Ad.find(filterObj).countDocuments();
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
  const { query: title } = req.query;

  const filterObj = {
    ...(title
      ? { title: { $regex: title, $options: "i" }, isApproved: true }
      : undefined),
  };

  if (!title) {
    return res.status(400).json({ message: "query string is empty" });
  }

  const ads = await Ad.find(filterObj)
    .sort({
      createdAt: -1,
    })
    .limit(5);

  if (!ads?.length) {
    return res.status(400).json({ message: "no ad with this query" });
  }

  return res.status(200).json({
    status: "success",
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

  if (ad.ok > 0 && ad.deletedCount > 0) {
    res.status(201).json({ status: "success" });
  } else {
    res.status(400).json({ status: "fail" });
  }
});
