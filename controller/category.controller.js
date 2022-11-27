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
      type: cat.type,
      children: getCategoriesAndSubcategories(categories, cat._id),
    });
  }
  return categoryList;
}

exports.createCategory = catchAsync(async (req, res) => {
  console.log(req.user, 'in controller');
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
    const categories = await Category.find({});
    console.log(categories, 'categories');
    if (!categories) {
      return res.status(504).json({ msg: 'مشکلی به وجود امده است' });
    }
    const categoryList = getCategoriesAndSubcategories(categories);

    res.status(200).send({ categoryList });
  } catch (e) {
    res.status(504).json({ msg: 'مشکلی به وجود امده است' });
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
  } catch (e) {
    console.log(e);
  }
};

exports.deleteCategories = async (req, res) => {
  const { ids } = req.body.payload;
  const deletedCategories = [];
  for (let i = 0; i < ids.length; i++) {
    const deleteCategory = await Category.findOneAndDelete({ _id: ids[i]._id });
    deletedCategories.push(deleteCategory);
  }
  if (deletedCategories.length === ids.length) {
    return res.status(200).json({ msg: 'دسته بندی با موفقیت حذف شد' });
  } else {
    return res.status(400).json({ msg: 'مشکلی به وجود آمده است' });
  }
};
