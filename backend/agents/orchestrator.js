const { buildContext } = require('../services/groq');
const ragService = require('../services/rag');

/**
 * Agent Orchestrator
 * Handles multi-step AI shopping workflows:
 * 1. Intent Detection → 2. Product Search → 3. Context Building
 * AI response generation is done on the frontend via Puter.js
 */

const INTENTS = {
  SEARCH: 'search',
  COMPARE: 'compare',
  RECOMMEND: 'recommend',
  INFO: 'info',
  AVAILABILITY: 'availability',
  GENERAL: 'general',
};

/**
 * Detect user intent from message
 */
const detectIntent = (message) => {
  const lower = message.toLowerCase();

  if (lower.includes('compare') || lower.includes('vs') || lower.includes('difference')) {
    return INTENTS.COMPARE;
  }
  if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('best')) {
    return INTENTS.RECOMMEND;
  }
  if (lower.includes('available') || lower.includes('stock') || lower.includes('store')) {
    return INTENTS.AVAILABILITY;
  }
  if (lower.includes('find') || lower.includes('search') || lower.includes('looking for') || lower.includes('show me')) {
    return INTENTS.SEARCH;
  }
  if (lower.includes('what is') || lower.includes('tell me about') || lower.includes('details')) {
    return INTENTS.INFO;
  }

  return INTENTS.GENERAL;
};

/**
 * Orchestrate product search and context building for the frontend AI
 */
const orchestrate = async ({ message, userId = null }) => {
  const intent = detectIntent(message);
  let products = [];
  let systemPrompt = '';

  // Step 1: Retrieve relevant products
  products = await ragService.searchProducts(message, 8);

  // Step 2: Build context
  const context = buildContext(products);

  // Step 3: Set specialized system prompt based on intent
  switch (intent) {
    case INTENTS.COMPARE:
      systemPrompt = 'You are a fashion product comparison specialist. Compare the products found and highlight key differences in price, style, color, usage, ratings, and value for money. Use a structured format.';
      break;
    case INTENTS.RECOMMEND:
      systemPrompt = 'You are a personalized fashion advisor. Based on the user\'s request, recommend the best products from the catalog. Explain why each recommendation suits their needs and suggest styling tips.';
      break;
    case INTENTS.AVAILABILITY:
      systemPrompt = 'You are a store availability assistant. Help the user find fashion products at nearby stores. Mention Click & Collect reservation option for the products.';
      break;
    case INTENTS.SEARCH:
      systemPrompt = 'You are a fashion search assistant. Present the found products in a clean, scannable format. Highlight key features, prices, colors, and ratings.';
      break;
    default:
      systemPrompt = '';
  }

  return {
    intent,
    systemPrompt,
    context,
    products: products.slice(0, 5),
    metadata: {
      totalResults: products.length,
      timestamp: new Date().toISOString(),
    },
  };
};

module.exports = { orchestrate, detectIntent, INTENTS };
