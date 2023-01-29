const mongoose = require('mongoose');

const savedSearch = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    searchTerm: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedSearch', savedSearch);
