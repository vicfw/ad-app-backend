const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    adImages: {
      xs: [String],
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
      type: number,
      required: true,
      min: 0,
    },
    kilometers: {
      type: Number,
      default: 0,
    },
    condition: {
      enum: ['new', 'used'],
      required: true,
    },
    saleBy: {
      enum: ['all', 'owner', 'dealer'],
      required: true,
    },
    transmission: {
      enum: ['automatic ', 'manual'],
      default: 'automatic',
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

module.exports = mongoose.model('Category', categorySchema);
