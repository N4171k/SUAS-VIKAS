const express = require('express');
const { Order, Cart, Product } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders
router.get('/', authenticate, async (req, res, next) => {
  try {
    const orders = await Order.findByUser(req.user.id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders - Create order from cart
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    const cartItems = await Cart.findByUser(req.user.id);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    const items = [];
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      items.push({
        productId: item.productId,
        title: product.title,
        price: parseFloat(product.price),
        quantity: item.quantity,
        image_url: product.image_url,
      });
    }

    if (items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      userId: req.user.id,
      items,
      total: total.toFixed(2),
      shippingAddress: shippingAddress || null,
      status: 'confirmed',
    });

    // Clear cart
    await Cart.clear(req.user.id);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/buy-now - Direct purchase
router.post('/buy-now', authenticate, async (req, res, next) => {
  try {
    const { productId, quantity = 1, shippingAddress } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const items = [{
      productId: product.id,
      title: product.title,
      price: parseFloat(product.price),
      quantity,
      image_url: product.image_url,
    }];

    const total = parseFloat(product.price) * quantity;

    const order = await Order.create({
      userId: req.user.id,
      items,
      total: total.toFixed(2),
      shippingAddress: shippingAddress || null,
      status: 'confirmed',
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

module.exports = router;