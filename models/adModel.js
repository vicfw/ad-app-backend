const mongoose = require('mongoose');

const adSchema = mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
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
        validate: function (value) {
          value.length > 10;
        },
        message: () => `cant be more than 10 photos`,
      },
      md: {
        type: [String],
        required: true,
        maxLength: 10,
      },
      lg: {
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
      ref: 'Category',
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
      type: String,
      default: '',
      min: 0,
    },
    condition: {
      type: String,
      enum: ['new', 'used'],
      // required: true,
    },
    saleBy: {
      type: String,
      enum: ['all', 'owner', 'dealer'],
      // required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    // trucks  & trailers category optional fields
    brand: {
      type: string,
    },
    kilometers: {
      type: Number,
    },
    transmission: {
      type: String,
      enum: ['automatic', 'manual'],
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
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

adSchema.index({ title: 'text' });

module.exports = mongoose.model('Ad', adSchema);
