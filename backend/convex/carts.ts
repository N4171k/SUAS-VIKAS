import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.string(),
    productId: v.string(),
    quantity: v.optional(v.number()),
    product: v.optional(v.object({
      productId: v.string(),
      title: v.string(),
      price: v.number(),
      image_url: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const existing = await ctx.db.query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("productId"), args.productId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { 
        quantity: args.quantity || 1, 
        updatedAt: now 
      });
      return { ...existing, quantity: args.quantity || 1, updatedAt: now };
    }
    
    await ctx.db.insert("carts", {
      userId: args.userId,
      productId: args.productId,
      quantity: args.quantity || 1,
      product: args.product || null,
      createdAt: now,
      updatedAt: now,
    });
    return { userId: args.userId, productId: args.productId, quantity: args.quantity || 1, product: args.product, createdAt: now, updatedAt: now };
  },
});

export const findByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("carts").withIndex("by_user", q => q.eq("userId", args.userId)).collect();
  },
});

export const findOne = query({
  args: { userId: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db.query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("productId"), args.productId))
      .first();
    return item || null;
  },
});

export const setQuantity = mutation({
  args: { userId: v.string(), productId: v.string(), quantity: v.number() },
  handler: async (ctx, args) => {
    const item = await ctx.db.query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("productId"), args.productId))
      .first();
    if (!item) return null;
    await ctx.db.patch(item._id, { quantity: args.quantity, updatedAt: new Date().toISOString() });
    return { ...item, quantity: args.quantity, updatedAt: new Date().toISOString() };
  },
});

export const remove = mutation({
  args: { userId: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db.query("carts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("productId"), args.productId))
      .first();
    if (item) await ctx.db.delete(item._id);
  },
});

export const clear = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("carts").withIndex("by_user", q => q.eq("userId", args.userId)).collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});