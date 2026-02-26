/**
 * AI Service (Server-side)
 * 
 * NOTE: AI chat is now handled on the frontend using Puter.js (puter.ai.chat()).
 * This module provides helper utilities for building product context strings
 * that the frontend can include in its Puter.js AI prompts.
 */

const SYSTEM_PROMPT = `You are VIKAS (Virtually Intelligent Knowledge Assisted Shopping), an AI shopping assistant for a fashion marketplace. You help customers:

1. Find fashion products based on their needs
2. Compare products and make recommendations
3. Answer questions about products, availability, and features
4. Provide personalized shopping and styling advice
5. Help with store locations and pickup reservations

Be friendly, concise, and helpful. Use the product context provided to give accurate information. If you don't have specific information, say so honestly. Format prices in Indian Rupees (₹).`;

/**
 * Build a product context string from an array of product objects.
 */
const buildContext = (products) => {
  if (!products || products.length === 0) return '';
  return products.map((p) =>
    `${p.title} - ₹${p.price} | Category: ${p.category} | Sub: ${p.sub_category || '-'} | Type: ${p.product_type || '-'} | Gender: ${p.gender || '-'} | Colour: ${p.colour || '-'} | Usage: ${p.usage || '-'} | Brand: ${p.brand || '-'} | Rating: ${p.rating}/5`
  ).join('\n');
};

module.exports = { SYSTEM_PROMPT, buildContext };
