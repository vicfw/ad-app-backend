const multer = require("multer");
const sharp = require("sharp");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const DeleteAccountToken = require("./../models/deleteAccountToken");
const Email = require("./../utils/email");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});
// const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    "name",
    "email",
    "photo",
    "notificationToken"
  );

  // 3) Update user document
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  }).select(req.body.website ? "-notificationToken" : "");

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.getCurrentUser = catchAsync(async (req, res, next) => {
  const query = req.query;
  const user = await User.findById(req.user.id).populate([
    {
      path: "ads",
      model: "Ad",
      options: {
        skip: query?.limit ? +query.limit : 0,
        limit: query?.page === 1 ? +query.limit : +query.page * +query.limit,
        sort: { createdAt: -1 },
      },
      populate: [
        {
          path: "ads.creator",
          model: "User",
        },
      ],
    },

    {
      path: "featuredAds",
      model: "FeatureAd",
      options: {
        select: "-createdAt",
      },
    },
  ]);

  return res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    { new: true }
  );

  if (!updatedUser) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

exports.deleteAccountCode = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const code = Math.floor(Math.random() * 9000 + 1000);

  await DeleteAccountToken.create({
    userId: user._id,
    token: code,
    deleteAccountExpires: Date.now() + 10 * 60 * 1000,
  });

  // 3) Send it to user's email
  try {
    await new Email(user, code).sendDeleteAccount();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    console.log(err, "err");
    await DeleteAccountToken.findOneAndDelete({ userId: user._id });
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.deleteAccountEmailValidation = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  const token = await DeleteAccountToken.findOne({
    token: code,
    deleteAccountExpires: { $gt: Date.now() },
  });
  if (!token) {
    return next(new AppError("Token is incorrect or its expired.", 400));
  }

  return res.json({ status: "success", message: "Provided code is correct" });
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

exports.deleteManyUsers = factory.deleteMany(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
