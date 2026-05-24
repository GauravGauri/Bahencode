const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const { customerDetails, items, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!customerDetails) {
      return res.status(400).json({ success: false, message: 'Please provide customer delivery details' });
    }

    // Process items, verify stock and calculate total amount
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }

      // Check stock
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` 
        });
      }

      // Calculate item price
      const price = product.discountPrice || product.price;
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      processedItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        size: item.size,
      });

      // Deduct stock
      product.stockQuantity -= item.quantity;
      product.inStock = product.stockQuantity > 0;
      await product.save();
    }

    // Apply Coupon discount if present
    let discountAmount = 0;
    if (couponCode) {
      const code = couponCode.toUpperCase().trim();
      if (code === 'WELCOME10') {
        discountAmount = Math.round(totalAmount * 0.1);
      } else if (code === 'FASHION20') {
        discountAmount = Math.round(totalAmount * 0.2);
      }
    }
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // Generate unique order ID in format BH-XXXXXX
    let isUnique = false;
    let orderId = '';
    while (!isUnique) {
      const digits = Math.floor(100000 + Math.random() * 900000);
      orderId = `BH-${digits}`;
      const existing = await Order.findOne({ orderId });
      if (!existing) {
        isUnique = true;
      }
    }

    // Determine initial payment status
    const paymentStatus = paymentMethod === 'card' ? 'Paid' : 'Pending';

    // Create order
    const order = await Order.create({
      user: req.user ? req.user._id : null,
      orderId,
      customerDetails,
      items: processedItems,
      totalAmount: finalAmount,
      paymentMethod,
      paymentStatus,
      orderStatus: 'Processing',
      couponCode: couponCode || null,
      discountAmount,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customerDetails.fullName': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .populate('items.product', 'images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    
    // Auto pay if status becomes delivered or shipped for card/cod
    if (orderStatus === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
