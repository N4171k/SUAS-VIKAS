const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Session } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, gender, clothing_size, footwear_size, favourite_colors, style_preferences } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password_hash,
      role: role === 'store_admin' ? 'store_admin' : 'customer',
      gender: gender || null,
      clothing_size: clothing_size || null,
      footwear_size: footwear_size || null,
      favourite_colors: favourite_colors || [],
      style_preferences: style_preferences || [],
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await Session.create({
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role,
        gender: user.gender, clothing_size: user.clothing_size, footwear_size: user.footwear_size,
        favourite_colors: user.favourite_colors, style_preferences: user.style_preferences,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await Session.create({
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await Session.update(
      { is_active: false },
      { where: { user_id: req.user.id, token: req.token } }
    );
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/auth/preferences — update size, colours, style for logged-in user
router.patch('/preferences', authenticate, async (req, res, next) => {
  try {
    const { gender, clothing_size, footwear_size, favourite_colors, style_preferences } = req.body;

    const updates = {};
    if (gender !== undefined) updates.gender = gender || null;
    if (clothing_size !== undefined) updates.clothing_size = clothing_size || null;
    if (footwear_size !== undefined) updates.footwear_size = footwear_size || null;
    if (favourite_colors !== undefined) updates.favourite_colors = Array.isArray(favourite_colors) ? favourite_colors : [];
    if (style_preferences !== undefined) updates.style_preferences = Array.isArray(style_preferences) ? style_preferences : [];

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No preference fields provided.' });
    }

    await req.user.update(updates);

    const fresh = await req.user.reload();

    res.json({
      message: 'Preferences updated successfully.',
      user: {
        id: fresh.id,
        name: fresh.name,
        email: fresh.email,
        role: fresh.role,
        gender: fresh.gender,
        clothing_size: fresh.clothing_size,
        footwear_size: fresh.footwear_size,
        favourite_colors: fresh.favourite_colors,
        style_preferences: fresh.style_preferences,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
