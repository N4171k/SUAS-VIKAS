const express = require('express');
const { Cart, Product } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', authenticate, async (req, res, next) => {
  try {
    const cartItems = await Cart.findByUser(req.user.id);

    // Attach live product data
    const items = [];
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      items.push(Cart.toAPI(item, product || item.product));
    }
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.product?.price || 0) * item.quantity);
    }, 0);

    res.json({ items, total: total.toFixed(2), count: items.length });
  } catch (error) {
    next(error);
  }
});

// POST /api/cart
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const existing = await Cart.findOne(req.user.id, productId);
    if (existing) {
      const updated = await Cart.setQuantity(req.user.id, productId, existing.quantity + quantity);
      return res.json(Cart.toAPI(updated, product));
    }

    const cartItem = await Cart.add({
      userId: req.user.id,
      productId,
      quantity,
      product,
    });

    res.status(201).json(Cart.toAPI(cartItem, product));
  } catch (error) {
    next(error);
  }
});

// PUT /api/cart/:productId
router.put('/:productId', authenticate, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    const cartItem = await Cart.findOne(req.user.id, productId);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    if (quantity <= 0) {
      await Cart.remove(req.user.id, productId);
      return res.json({ message: 'Item removed from cart.' });
    }

    const updated = await Cart.setQuantity(req.user.id, productId, quantity);
    const product = await Product.findById(productId);
    res.json(Cart.toAPI(updated, product));
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart/:productId
router.delete('/:productId', authenticate, async (req, res, next) => {
  try {
    const cartItem = await Cart.findOne(req.user.id, req.params.productId);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    await Cart.remove(req.user.id, req.params.productId);
    res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;