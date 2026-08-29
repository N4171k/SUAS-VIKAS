import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    password_hash: v.string(),
    role: v.string(),
    avatar: v.optional(v.string()),
    gender: v.optional(v.string()),
    clothing_size: v.optional(v.string()),
    footwear_size: v.optional(v.string()),
    favourite_colors: v.optional(v.array(v.string())),
    style_preferences: v.optional(v.array(v.string())),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_email", ["email"]),

  products: defineTable({
    productId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    category: v.optional(v.string()),
    subCategory: v.optional(v.string()),
    brand: v.optional(v.string()),
    rating: v.number(),
    isArEnabled: v.boolean(),
    source: v.string(),
    attributes: v.optional(v.any()),
    embedding: v.optional(v.array(v.number())),
    updatedAt: v.string(),
  }).index("by_category", ["category"]),

  stores: defineTable({
    storeId: v.string(),
    name: v.string(),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    hours: v.optional(v.object({
      open: v.string(),
      close: v.string(),
    })),
    capacityPerSlot: v.number(),
    is_active: v.boolean(),
    updatedAt: v.string(),
  }),

  carts: defineTable({
    userId: v.string(),
    productId: v.string(),
    quantity: v.number(),
    product: v.optional(v.object({
      productId: v.string(),
      title: v.string(),
      price: v.number(),
      image_url: v.optional(v.string()),
    })),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]),

  orders: defineTable({
    userId: v.string(),
    orderId: v.string(),
    items: v.array(v.any()),
    total: v.number(),
    status: v.string(),
    shippingAddress: v.optional(v.any()),
    paymentMethod: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]).index("by_orderId", ["orderId"]),

  reservations: defineTable({
    reservationId: v.string(),
    userId: v.string(),
    productId: v.string(),
    storeId: v.string(),
    quantity: v.number(),
    slotTime: v.optional(v.string()),
    status: v.string(),
    price: v.optional(v.number()),
    productImage: v.optional(v.string()),
    productName: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"]).index("by_store", ["storeId"]),

  inventory: defineTable({
    storeId: v.string(),
    productId: v.string(),
    quantity: v.number(),
    reserved: v.number(),
    version: v.number(),
    updatedAt: v.string(),
  }).index("by_product", ["productId"]).index("by_store", ["storeId"]),

  sessions: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    token: v.string(),
    expiresAt: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),

  categories: defineTable({
    categoryId: v.string(),
    name: v.string(),
    subCategories: v.array(v.string()),
    type: v.string(),
    updatedAt: v.string(),
  }),

  aiLogs: defineTable({
    logId: v.string(),
    userId: v.string(),
    createdAt: v.string(),
    query: v.optional(v.string()),
    responseSnippet: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    intent: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});