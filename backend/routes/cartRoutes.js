const express = require('express');
const { Cart, Product } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', authenticate, async (req, res, next) => {
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, as: 'product' }],
      order: [['created_at', 'DESC']],
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    res.json({ items: cartItems, total: total.toFixed(2), count: cartItems.length });
  } catch (error) {
    next(error);
  }
});

// POST /api/cart
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const [cartItem, created] = await Cart.findOrCreate({
      where: { user_id: req.user.id, product_id: productId },
      defaults: { quantity },
    });

    if (!created) {
      cartItem.quantity += quantity;
      await cartItem.save();
    }

    const fullItem = await Cart.findByPk(cartItem.id, {
      include: [{ model: Product, as: 'product' }],
    });

    res.status(created ? 201 : 200).json(fullItem);
  } catch (error) {
    next(error);
  }
});

// PUT /api/cart/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      return res.json({ message: 'Item removed from cart.' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const fullItem = await Cart.findByPk(cartItem.id, {
      include: [{ model: Product, as: 'product' }],
    });

    res.json(fullItem);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const cartItem = await Cart.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    await cartItem.destroy();
    res.json({ message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
