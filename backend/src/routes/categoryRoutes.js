const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// Public route to view categories
router.get('/', getCategories);

// Admin-only routes to add and delete categories
router.post('/', protect, authorize('admin'), createCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
