const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public catalog routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected CMS admin routes
router.post('/', protect, authorize('admin'), upload.array('images', 10), createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 10), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
