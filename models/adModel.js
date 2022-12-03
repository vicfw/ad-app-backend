const mongoose = require('mongoose');

const adSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minLength: 3,
    },
    adImages: {
      xs: {
        type: [String],
        required: true,
        maxLength: 10,
      },
    },

    description: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: Number,
      default: 0,
      min: 0,
    },
    condition: {
      type: String,
      enum: ['new', 'used'],
      required: true,
    },
    saleBy: {
      type: String,
      enum: ['all', 'owner', 'dealer'],
      required: true,
    },
    // trucks category optional fields
    kilometers: {
      type: Number,
    },
    transmission: {
      type: String,
      enum: ['automatic ', 'manual'],
    },
    engineHP: {
      type: String,
      trim: true,
      lowercase: true,
    },
    engine: {
      type: String,
      trim: true,
      lowercase: true,
    },
    exteriorColor: {
      type: String,
      trim: true,
      lowercase: true,
    },
    differential: {
      type: String,
      trim: true,
      lowercase: true,
    },
    frontAxel: {
      type: String,
      trim: true,
      lowercase: true,
    },
    realAxel: {
      type: String,
      trim: true,
      lowercase: true,
    },
    suspension: {
      type: String,
      trim: true,
      lowercase: true,
    },
    wheelbase: {
      type: String,
      trim: true,
      lowercase: true,
    },
    wheels: {
      type: String,
      enum: ['steel', 'aluminum'],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ad', adSchema);
