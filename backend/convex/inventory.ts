import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const findOne = query({
  args: { storeId: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db.query("inventory")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .filter(q => q.eq(q.field("productId"), args.productId))
      .first();
    return item || null;
  },
});

export const findByProduct = query({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("inventory").withIndex("by_product", q => q.eq("productId", args.productId)).collect();
  },
});

export const findByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("inventory").withIndex("by_store", q => q.eq("storeId", args.storeId)).collect();
  },
});

export const upsert = mutation({
  args: {
    storeId: v.string(),
    productId: v.string(),
    quantity: v.optional(v.number()),
    reserved: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("inventory")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .filter(q => q.eq(q.field("productId"), args.productId))
      .first();
    
    const now = new Date().toISOString();
    if (existing) {
      await ctx.db.patch(existing._id, { 
        quantity: args.quantity || 0, 
        reserved: args.reserved || 0,
        updatedAt: now,
      });
      return { ...existing, quantity: args.quantity || 0, reserved: args.reserved || 0, updatedAt: now };
    }
    
    await ctx.db.insert("inventory", {
      storeId: args.storeId,
      productId: args.productId,
      quantity: args.quantity || 0,
      reserved: args.reserved || 0,
      version: 0,
      updatedAt: now,
    });
    return { storeId: args.storeId, productId: args.productId, quantity: args.quantity || 0, reserved: args.reserved || 0, version: 0, updatedAt: now };
  },
});

export const reserveStock = mutation({
  args: { storeId: v.string(), productId: v.string(), quantity: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const item = await ctx.db.query("inventory")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .filter(q => q.eq(q.field("productId"), args.productId))
      .first();
    
    if (!item) throw new Error("Not enough stock or product not found at this store.");
    if ((item.quantity - item.reserved) < (args.quantity || 1)) {
      throw new Error("Not enough stock or product not found at this store.");
    }
    
    const now = new Date().toISOString();
    await ctx.db.patch(item._id, { 
      reserved: item.reserved + (args.quantity || 1),
      version: item.version + 1,
      updatedAt: now,
    });
    return { ...item, reserved: item.reserved + (args.quantity || 1), version: item.version + 1, updatedAt: now };
  },
});

export const releaseStock = mutation({
  args: { storeId: v.string(), productId: v.string(), quantity: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const item = await ctx.db.query("inventory")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .filter(q => q.eq(q.field("productId"), args.productId))
      .first();
    
    if (!item) return null;
    
    const now = new Date().toISOString();
    await ctx.db.patch(item._id, { 
      reserved: Math.max(0, item.reserved - (args.quantity || 1)),
      updatedAt: now,
    });
    return { ...item, reserved: Math.max(0, item.reserved - (args.quantity || 1)), updatedAt: now };
  },
});

export const fulfillStock = mutation({
  args: { storeId: v.string(), productId: v.string(), quantity: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const item = await ctx.db.query("inventory")
      .withIndex("by_store", q => q.eq("storeId", args.storeId))
      .filter(q => q.eq(q.field("productId"), args.productId))
      .first();
    
    if (!item) return null;
    
    const now = new Date().toISOString();
    await ctx.db.patch(item._id, { 
      quantity: Math.max(0, item.quantity - (args.quantity || 1)),
      reserved: Math.max(0, item.reserved - (args.quantity || 1)),
      updatedAt: now,
    });
    return { ...item, quantity: Math.max(0, item.quantity - (args.quantity || 1)), reserved: Math.max(0, item.reserved - (args.quantity || 1)), updatedAt: now };
  },
});

export const availableProductIds = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("inventory").collect();
    const set = new Set<string>();
    items.forEach(it => {
      if ((it.quantity || 0) - (it.reserved || 0) > 0) set.add(it.productId);
    });
    return [...set];
  },
});