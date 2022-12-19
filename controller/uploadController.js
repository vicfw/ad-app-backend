const catchAsync = require('../utils/catchAsync');

exports.categoryImage = catchAsync(async (req, res, next) => {
  if (!req.file.fieldname) {
    return res.status(400).json({ status: 'fail', message: 'Enter a File!' });
  }

  res.status(200).json({
    status: 'success',
    message: 'uploaded successfully',
    data: req.file.Location,
  });
});

exports.profilePhoto = catchAsync(async (req, res, next) => {
  if (!req.file.fieldname) {
    return res.status(400).json({ status: 'fail', message: 'Enter a File!' });
  }

  res.status(200).json({
    status: 'success',
    message: 'uploaded successfully',
    data: req.file.Location,
  });
});

exports.adImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'fail',
      message: 'Something went wrong!',
    });
  }
  return res.status(200).json({
    status: 'success',
    message: 'uploaded successfully',
    data: req.file.Location,
  });
});
