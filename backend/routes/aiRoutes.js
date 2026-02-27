const express = require('express');
const { Product } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { buildSystemPrompt, buildContext } = require('../services/groq');
const ragService = require('../services/rag');

const router = express.Router();

// POST /api/ai/query - Search products & return context for client-side AI (Gemini 2.5 Flash)
router.post('/query', optionalAuth, async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Fetch catalog summary so AI knows what the store carries
    const catalogSummary = await ragService.getCatalogSummary();
    const systemPrompt = buildSystemPrompt(catalogSummary);

    // Use RAG to find relevant products
    const relevantProducts = await ragService.searchProducts(message);

    // Build context string for the frontend to pass to Gemini
    let context = buildContext(relevantProducts);

    // If no products found, add a hint so the AI knows
    if (relevantProducts.length === 0) {
      context = `No products matched the query "${message}". The store carries fashion items: ${catalogSummary.categories}. Product types include: ${catalogSummary.productTypes}. Suggest relevant fashion items the user might like instead.`;
    }

    res.json({
      systemPrompt,
      context,
      products: relevantProducts.slice(0, 5),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/product/:id/ask - Get product context for client-side AI
router.post('/product/:id/ask', optionalAuth, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const context = `Product: ${product.title}\nPrice: ₹${product.price}\nCategory: ${product.category}\nSub-Category: ${product.sub_category || '-'}\nType: ${product.product_type || '-'}\nGender: ${product.gender || '-'}\nColour: ${product.colour || '-'}\nUsage: ${product.usage || '-'}\nBrand: ${product.brand}\nRating: ${product.rating}/5\nDescription: ${product.description || 'N/A'}\nFeatures: ${product.features || 'N/A'}`;

    res.json({
      systemPrompt: 'You are a helpful fashion shopping assistant. Answer questions about this specific product based on the provided information. Be concise and helpful.',
      context,
      product,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/compare - Get comparison context for client-side AI
router.post('/compare', optionalAuth, async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!productIds || productIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 product IDs required.' });
    }

    const products = await Product.findAll({
      where: { id: productIds },
    });

    if (products.length < 2) {
      return res.status(404).json({ error: 'Products not found.' });
    }

    const context = buildContext(products);

    res.json({
      systemPrompt: 'You are a fashion product comparison expert. Compare these products and highlight key differences in price, style, usage, ratings, and value for money. Provide a clear recommendation.',
      context,
      products,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/recommendations/:productId
router.get('/recommendations/:productId', optionalAuth, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Find similar products by category, sub_category, gender, or colour
    const { Op } = require('sequelize');
    const recommendations = await Product.findAll({
      where: {
        id: { [Op.ne]: product.id },
        is_active: true,
        [Op.or]: [
          { category: product.category, sub_category: product.sub_category },
          { gender: product.gender, product_type: product.product_type },
          { brand: product.brand },
          { colour: product.colour, category: product.category },
        ],
      },
      limit: 8,
      order: [['rating', 'DESC']],
    });

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
