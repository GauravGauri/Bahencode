const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper middleware to optionally check/bind user without blocking guests
const resolveOptionalUser = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      console.warn('Optional user resolve failed:', err.message);
    }
  }
  next();
};

// Public/Guest Order Placement
router.post('/', resolveOptionalUser, createOrder);

// Admin-only operations
router.get('/', protect, authorize('admin'), getOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
