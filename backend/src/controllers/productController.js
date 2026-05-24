const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Get all products (with query filter/sort)
exports.getProducts = async (req, res) => {
  try {
    const { category, size, minPrice, maxPrice, search, isBestseller, isNewIn, sort } = req.query;
    let query = {};

    if (category) {
      let targetCategory = null;
      if (mongoose.Types.ObjectId.isValid(category)) {
        targetCategory = await Category.findById(category);
      } else {
        targetCategory = await Category.findOne({ name: { $regex: new RegExp('^' + category.trim() + '$', 'i') } });
      }

      if (targetCategory) {
        const getDescendantIds = async (parentId) => {
          let ids = [parentId];
          const children = await Category.find({ parent: parentId });
          for (const child of children) {
            const childIds = await getDescendantIds(child._id);
            ids = [...ids, ...childIds];
          }
          return ids;
        };
        const categoryIds = await getDescendantIds(targetCategory._id);
        query.category = { $in: categoryIds };
      } else {
        query.category = null;
      }
    }

    if (size) {
      query.sizes = size;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isBestseller) {
      query.isBestseller = isBestseller === 'true';
    }

    if (isNewIn) {
      query.isNewIn = isNewIn === 'true';
    }

    let queryExec = Product.find(query).populate({
      path: 'category',
      populate: {
        path: 'parent',
        populate: { path: 'parent' }
      }
    });

    // Sorting
    if (sort) {
      if (sort === 'priceAsc') {
        queryExec = queryExec.sort({ price: 1 });
      } else if (sort === 'priceDesc') {
        queryExec = queryExec.sort({ price: -1 });
      } else if (sort === 'oldest') {
        queryExec = queryExec.sort({ createdAt: 1 });
      } else {
        queryExec = queryExec.sort({ createdAt: -1 }); // Latest
      }
    } else {
      queryExec = queryExec.sort({ createdAt: -1 });
    }

    const products = await queryExec;
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product details
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: 'category',
      populate: {
        path: 'parent',
        populate: { path: 'parent' }
      }
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, sizes, stockQuantity, isBestseller, isNewIn } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (images.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }

    let processedSizes = sizes;
    if (typeof sizes === 'string') {
      processedSizes = sizes.split(',').map(s => s.trim().toUpperCase());
    }

    let resolvedCategory = category;
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      const catObj = await Category.findOne({ name: { $regex: new RegExp('^' + category.trim() + '$', 'i') } });
      if (catObj) {
        resolvedCategory = catObj._id;
      }
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category: resolvedCategory,
      sizes: processedSizes || ['S', 'M', 'L'],
      images,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 10,
      inStock: stockQuantity > 0,
      isBestseller: isBestseller === 'true' || isBestseller === true,
      isNewIn: isNewIn === 'true' || isNewIn === true,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    let images = product.images;
    if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }

    if (req.body.deletedImages) {
      const deleted = Array.isArray(req.body.deletedImages) ? req.body.deletedImages : [req.body.deletedImages];
      images = images.filter(img => !deleted.includes(img));

      deleted.forEach(img => {
        if (img.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '../..', img);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    let processedSizes = req.body.sizes;
    if (typeof req.body.sizes === 'string') {
      processedSizes = req.body.sizes.split(',').map(s => s.trim().toUpperCase());
    }

    let resolvedCategory = req.body.category || product.category;
    if (req.body.category && !mongoose.Types.ObjectId.isValid(req.body.category)) {
      const catObj = await Category.findOne({ name: { $regex: new RegExp('^' + req.body.category.trim() + '$', 'i') } });
      if (catObj) {
        resolvedCategory = catObj._id;
      }
    }

    const updatedData = {
      name: req.body.name || product.name,
      description: req.body.description || product.description,
      price: req.body.price ? Number(req.body.price) : product.price,
      discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : product.discountPrice,
      category: resolvedCategory,
      sizes: processedSizes || product.sizes,
      images,
      stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : product.stockQuantity,
      isBestseller: req.body.isBestseller !== undefined ? (req.body.isBestseller === 'true' || req.body.isBestseller === true) : product.isBestseller,
      isNewIn: req.body.isNewIn !== undefined ? (req.body.isNewIn === 'true' || req.body.isNewIn === true) : product.isNewIn,
    };

    updatedData.inStock = updatedData.stockQuantity > 0;

    product = await Product.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.images.forEach(img => {
      if (img.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '../..', img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
