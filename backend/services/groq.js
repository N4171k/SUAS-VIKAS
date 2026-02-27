/**
 * AI Service (Server-side)
 * 
 * NOTE: AI chat is now handled on the frontend using the Gemini 2.5 Flash API.
 * This module provides helper utilities for building product context strings
 * that the frontend can include in its Gemini AI prompts.
 */

/**
 * Build the system prompt dynamically with catalog awareness.
 */
const buildSystemPrompt = (catalogSummary) => {
  let catalogInfo = '';
  if (catalogSummary && catalogSummary.totalProducts > 0) {
    catalogInfo = `\n\nYOUR STORE CATALOG:\n- Total products: ${catalogSummary.totalProducts}\n- Categories: ${catalogSummary.categories}\n- For genders: ${catalogSummary.genders}\n- Product types include: ${catalogSummary.productTypes}\n- Available colours: ${catalogSummary.colours}\n\nIMPORTANT: You can ONLY recommend products from this catalog. If a customer asks for something not in the catalog (electronics, groceries, etc.), politely let them know you are a fashion-only store and suggest relevant fashion alternatives.`;
  }

  return `You are VIKAS (Virtually Intelligent Knowledge Assisted Shopping), an AI shopping assistant for a fashion marketplace. You help customers:

1. Find fashion products (clothing, footwear, accessories) based on their needs
2. Compare products and make recommendations 
3. Answer questions about products, availability, and features
4. Provide personalized shopping and styling advice
5. Help with store locations and pickup reservations

Rules:
- ONLY recommend products from the catalog context provided. Never invent products.
- When products are provided in context, present them with name, price, and key details.
- If the user asks for something outside fashion (electronics, food, etc.), politely redirect.
- Be friendly, concise, and helpful.
- Format prices in Indian Rupees (₹).
- When showing products, always mention the product ID so users can view details.${catalogInfo}`;
};

// Backwards-compatible static prompt (used as fallback)
const SYSTEM_PROMPT = buildSystemPrompt(null);

/**
 * Build a product context string from an array of product objects.
 */
const buildContext = (products) => {
  if (!products || products.length === 0) return '';
  return products.map((p, i) =>
    `${i + 1}. [ID:${p.id}] ${p.title} - ₹${p.price} | Category: ${p.category} | Sub: ${p.sub_category || '-'} | Type: ${p.product_type || '-'} | Gender: ${p.gender || '-'} | Colour: ${p.colour || '-'} | Usage: ${p.usage || '-'} | Rating: ${p.rating}/5`
  ).join('\n');
};

module.exports = { SYSTEM_PROMPT, buildSystemPrompt, buildContext };
