const Category = require('../models/categoryModel');
const catchAsync = require('../utils/catchAsync');

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
    });
  }
  return categoryList;
}

exports.createCategory = catchAsync(async (req, res) => {
  // let categoryImage;
  // if (req.file) {
  //   categoryImage = `/public/${req.file.filename}`;
  // }
  const category = new Category({
    ...req.body,
    // categoryImage,
  });
  await category.save();

  res.status(201).json({ status: 'success', data: category });
});

exports.getallCategories = catchAsync(async (req, res, next) => {
  try {
    const categories = await Category.find({}).populate('ads');

    if (!categories) {
      return res.status(504).json({ msg: 'no category found' });
    }
    const categoryList = getCategoriesAndSubcategories(categories);

    res.status(200).send({ categoryList });
  } catch (e) {
    res.status(504).json({ msg: ' Something went wrong' });
  }
});

exports.getallCategoriesWithoutChildren = catchAsync(async (req, res, next) => {
  try {
    const categories = await Category.find({});

    if (!categories) {
      return res.status(504).json({ msg: ' Something went wrong' });
    }

    res.status(200).json({ status: 'success', data: categories });
  } catch (e) {
    res.status(504).json({ msg: ' Something went wrong' });
  }
});

exports.updateCategories = async (req, res) => {
  try {
    const { _id, name, parentId, type } = req.body;
    const updatedCategories = [];
    if (name instanceof Array) {
      for (let i = 0; i < name.length; i++) {
        const category = {
          name: name[i],
          type: type[i],
        };
        if (parentId[i] !== '') {
          category.parentId = parentId[i];
        }
        const updateCategory = await Category.findOneAndUpdate(
          { _id: _id[i] },
          category,
          {
            new: true,
          }
        );
        updatedCategories.push(updateCategory);
      }
      return res.status(201).json({ updatedCategories });
    } else {
      const category = {
        name,
        type,
        _id,
      };
      if (parentId !== '') {
        category.parentId = parentId;
      }
      const updatedCategory = await Category.findOneAndUpdate(
        { _id: _id },
        category,
        {
          new: true,
        }
      );
      return res.status(201).json({ updatedCategory });
    }
  } catch (e) {}
};

exports.deleteCategories = async (req, res) => {
  const { ids } = req.body;
  const deletedCategories = [];
  for (let i = 0; i < ids.length; i++) {
    const deleteCategory = await Category.findOneAndDelete({ _id: ids[i] });
    deletedCategories.push(deleteCategory);
  }
  if (deletedCategories.length === ids.length) {
    return res.status(200).json({ msg: 'Category deleted successfully' });
  } else {
    return res.status(400).json({ msg: 'Something went wrong!' });
  }
};

exports.getLastFourCategories = catchAsync(async (req, res, next) => {
  const lastFourCategories = await Category.find({
    parentId: null,
  })
    .limit(4)
    .sort({ createdAt: -1 });

  res.status(200).json({ status: 'success', data: lastFourCategories });
});
