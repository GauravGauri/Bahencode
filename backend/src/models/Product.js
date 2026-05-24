const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  discountPrice: {
    type: Number,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category'],
  },
  sizes: {
    type: [String],
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    default: ['S', 'M', 'L'],
  },
  images: {
    type: [String],
    required: [true, 'Please add at least one image URL'],
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 10,
  },
  isBestseller: {
    type: Boolean,
    default: false,
  },
  isNewIn: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
