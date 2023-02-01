const catchAsync = require('../utils/catchAsync');
const SavedSearch = require('../models/savedSearch');

exports.createSavedSearch = catchAsync(async (req, res, next) => {
  const savedSearch = await SavedSearch.create({
    ...req.body,
    user: req.user._id,
  });

  if (!savedSearch) {
    return res
      .status(400)
      .json({ status: 'error', message: 'something went wrong!' });
  }

  return res.status(201).json({ status: 'success', data: savedSearch });
});

exports.getSavedSearch = catchAsync(async (req, res, next) => {
  const { count } = req.query;
  const savedSearch = await SavedSearch.find({ user: req.user._id })
    .populate('user')
    .limit(parseInt(count) ?? 5)
    .sort({ createdAt: -1 });

  if (!savedSearch) {
    return res.status(400).json({
      status: 'error',
      message: 'there are no saved search for this user',
    });
  }

  return res
    .status(200)
    .json({ status: 'success', count: savedSearch.length, data: savedSearch });
});

exports.deleteSavedSearch = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ status: 'error', message: 'provide id param to request' });
  }

  await SavedSearch.findByIdAndDelete(id);

  return res.status(200).json({ status: 'success', message: 'deleted' });
});
