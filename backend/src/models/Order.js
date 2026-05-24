const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  size: {
    type: String,
    required: true,
  },
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  customerDetails: {
    fullName: {
      type: String,
      required: [true, 'Please add a customer name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email address'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    address: {
      type: String,
      required: [true, 'Please add shipping address'],
    },
    city: {
      type: String,
      required: [true, 'Please add city'],
    },
    state: {
      type: String,
      required: [true, 'Please add state'],
    },
    pincode: {
      type: String,
      required: [true, 'Please add pincode'],
    },
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card'],
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing',
  },
  couponCode: {
    type: String,
    default: null,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);
