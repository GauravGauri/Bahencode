const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Helper to update product average rating
const updateProductRatingStats = async (productId) => {
  const reviews = await Review.find({ product: productId });
  
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });
    return;
  }

  const numReviews = reviews.length;
  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const rating = Math.round((totalRating / numReviews) * 10) / 10; // Round to 1 decimal place

  await Product.findByIdAndUpdate(productId, {
    rating,
    numReviews,
  });
};

// @desc    Create a product review
// @route   POST /api/reviews/product/:productId
// @access  Public
exports.createProductReview = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide all review details' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = await Review.create({
      product: productId,
      name,
      email,
      rating: Number(rating),
      comment,
    });

    // Recalculate stats
    await updateProductRatingStats(productId);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews (Admin only)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name images price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review (Admin only)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate stats
    await updateProductRatingStats(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
