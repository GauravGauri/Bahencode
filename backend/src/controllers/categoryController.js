const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate({
      path: 'parent',
      select: 'name parent',
      populate: {
        path: 'parent',
        select: 'name'
      }
    });
    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Check if category name already exists under this parent
    const categoryExists = await Category.findOne({ name: name.trim(), parent: parentId });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category name already exists under this parent' });
    }

    // Validate parent if provided
    let parentId = null;
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(404).json({ success: false, message: 'Parent category not found' });
      }
      parentId = parentCategory._id;
    }

    const category = await Category.create({
      name: name.trim(),
      parent: parentId,
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Nullify parent of all child categories referencing this category
    await Category.updateMany({ parent: category._id }, { parent: null });

    await Category.findByIdAndDelete(category._id);

    res.status(200).json({
      success: true,
      message: 'Category removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
