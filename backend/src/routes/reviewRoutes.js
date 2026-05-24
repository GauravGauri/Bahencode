const express = require('express');
const router = express.Router();
const {
  createProductReview,
  getProductReviews,
  getReviewsAdmin,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public endpoints
router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', createProductReview);

// Admin-only endpoints
router.get('/', protect, authorize('admin'), getReviewsAdmin);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
