const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    categoryImage: { type: String, default: "pic" },

    parentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("ads", {
  ref: "Ad",
  foreignField: "category",
  localField: "_id",
});

module.exports = mongoose.model("Category", categorySchema);
