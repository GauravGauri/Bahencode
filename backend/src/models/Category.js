const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters'],
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add compound index for unique name under same parent
CategorySchema.index({ name: 1, parent: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
