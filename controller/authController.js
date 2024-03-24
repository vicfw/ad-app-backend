const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");
const ForgetPasswordToken = require("./../models/forgetPasswordToken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res, hasCookie) => {
  const token = signToken(user._id);
  const isSecure = req.headers.origin === "https://www.gettruck.ca";
  if (hasCookie) {
    res.cookie("jwt", token, {
      path: "/",
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),

      httpOnly: true,
      sameSite: "lax",
      domain: isSecure ? ".gettruck.ca" : undefined,
      secure: isSecure,
    });
  }

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  // const url = `${req.protocol}://${req.get("host")}/me`;

  // await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res, true);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email })
    .select("+password")
    .select("-notificationToken");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (!user.active) {
    return next(
      new AppError(
        "Your account is disabled,contact us for more information.",
        400
      )
    );
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res, true);
});

exports.mobileSignup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  // const url = `${req.protocol}://${req.get("host")}/me`;
  //
  // await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res, false);
});

exports.mobileLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res, false);
});

exports.me = async (req, res, next) => {
  if (req.headers?.cookie) {
    const jwtToken = req.cookies?.jwt;

    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        jwtToken,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id).populate([
        {
          path: "ads",
          model: "Ad",
          // options: {
          //   skip: query?.limit ? +query.limit : 0,
          //   limit:
          //     query?.page === 1 ? +query.limit : +query.page * +query.limit,
          //   sort: { createdAt: -1 },
          // },
        },
        {
          path: "featuredAds",
          model: "FeatureAd",
          options: {
            select: "-createdAt",
          },
        },
      ]);

      if (!currentUser) {
        return res
          .status(200)
          .json({ status: "success", message: "guess user" });
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        next();
      }

      // THERE IS A LOGGED IN USER
      return res.status(200).json({ status: "success", data: currentUser });
    } catch (err) {
      next();
    }
  } else {
    return res.status(200).json({ status: "success", data: null });
  }
};

exports.logout = (req, res) => {
  const isSecure = req.headers.origin === "https://www.gettruck.ca";
  res.cookie("jwt", "loggedout", {
    path: "/",
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
    sameSite: "lax",
    domain: isSecure ? ".gettruck.ca" : undefined,
    secure: isSecure,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  console.log("hererere");
  // 1) Getting token and check of it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // const hasToken = await ForgetPasswordToken.findOne({
  //   userId: user._id,
  //   passwordResetExpires: { $gt: Date.now() },
  // });

  // if (!hasToken) {
  //   return next(new AppError("Already reset token sent to your email", 400));
  // }

  // 2) Generate the random reset token
  const code = Math.floor(Math.random() * 9000 + 1000);

  const token = await ForgetPasswordToken.create({
    userId: user._id,
    token: code,
    passwordResetExpires: Date.now() + 10 * 60 * 1000,
  });

  // 3) Send it to user's email
  try {
    await new Email(user, code).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    await ForgetPasswordToken.findOneAndDelete({ userId: user._id });
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.forgotPasswordValidation = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  const token = await ForgetPasswordToken.findOne({
    token: code,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!token) {
    return next(new AppError("Token is incorrect or its expired.", 400));
  }

  return res.json({ status: "success", message: "Provided code is correct" });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token: bodyToken, password, confirmPassword } = req.body;

  const token = await ForgetPasswordToken.findOne({
    token: bodyToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!token) {
    return next(new AppError("Token is incorrect or its expired", 400));
  }

  const user = await User.findOne({
    _id: token.userId,
  });

  // if (!user) {
  //   return next(new AppError("Something went wrong", 500));
  // }

  user.password = password;
  user.confirmPassword = confirmPassword;
  await ForgetPasswordToken.findByIdAndDelete(token._id);
  await user.save();

  return res.json({
    status: "success",
    message: "Password changed successfully.",
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log("here");
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
