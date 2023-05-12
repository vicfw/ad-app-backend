const Category = require("../models/categoryModel");
const catchAsync = require("../utils/catchAsync");

function getCategoriesAndSubcategories(categories, parentId = null) {
  const categoryList = [];
  let category;
  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }
  for (let cat of category) {
    categoryList.push({
      _id: cat._id,
      name: cat.name,
      parentId: cat.parentId,
      categoryImage: cat.categoryImage,
      ads: cat.ads,
      children: getCategoriesAndSubcategories(categories, cat._id),
      createdAt: cat.createdAt,
    });
  }
  return categoryList.sort((a, b) => b.createdAt - a.createdAt);
}

exports.createCategory = catchAsync(async (req, res) => {
  const category = new Category({
    ...req.body,
  });
  await category.save();

  res.status(201).json({ status: "success", data: category });
});

exports.getallCategories = catchAsync(async (req, res, next) => {
  try {
    const categories = await Category.find({})
      .populate({ path: "ads", match: { isApproved: true } })
      .sort({ createdAt: 1 });

    if (!categories) {
      return res.status(504).json({ msg: "no category found" });
    }
    const categoryList = getCategoriesAndSubcategories(categories);

    res.status(200).send({ categoryList });
  } catch (e) {
    res.status(504).json({ msg: " Something went wrong" });
  }
});

exports.getallCategoriesWithoutChildren = catchAsync(async (req, res, next) => {
  try {
    const categories = await Category.find({});

    if (!categories) {
      return res.status(504).json({ msg: " Something went wrong" });
    }

    res.status(200).json({ status: "success", data: categories });
  } catch (e) {
    res.status(504).json({ msg: " Something went wrong" });
  }
});

exports.updateCategories = catchAsync(async (req, res) => {
  const { _id, name, parentId, categoryImage } = req.body;

  const category = {
    name,
    parentId,
    categoryImage,
  };

  const updatedCategory = await Category.findOneAndUpdate(
    { _id: _id },
    category,
    {
      new: true,
    }
  );
  return res.status(201).json({ updatedCategory });
});

exports.deleteCategories = catchAsync(async (req, res) => {
  const { _id } = req.body;

  const category = await Category.findOne({ _id });


  if (!category.parentId) {
    const children = await Category.find({ parentId: _id });
    const childrenIds = children.map((child) => child._id);

    const subChildren = await Category.find({ parentId: childrenIds });
    const subChildrenIds = subChildren.map((subChild) => subChild._id);

    const idsForDelete = childrenIds.concat(subChildrenIds).concat([_id]);

    if (!idsForDelete) {
      return;
    }

    await Category.deleteMany({ _id: idsForDelete });

    return res.status(200).json("deleted many");
  }

  await Category.findByIdAndDelete(_id);

  return res.status(200).json("deleted one");
});

exports.getLastFourCategories = catchAsync(async (req, res, next) => {
  const lastFourCategories = await Category.find({
    parentId: null,
  })
    .limit(4)
    .sort({ createdAt: 1 });

  res.status(200).json({ status: "success", data: lastFourCategories });
});
