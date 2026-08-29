import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

export const create = mutation({
  args: {
    userId: v.string(),
    items: v.array(v.any()),
    total: v.number(),
    shippingAddress: v.optional(v.any()),
    paymentMethod: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orderId = `ord_${uuidv4()}`;
    const now = new Date().toISOString();
    await ctx.db.insert("orders", {
      userId: args.userId,
      orderId,
      items: args.items,
      total: args.total,
      status: args.status || "confirmed",
      shippingAddress: args.shippingAddress || null,
      paymentMethod: args.paymentMethod || "cod",
      createdAt: now,
      updatedAt: now,
    });
    return { orderId, ...args, createdAt: now, updatedAt: now };
  },
});

export const findByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("orders").withIndex("by_user", q => q.eq("userId", args.userId)).collect();
  },
});

export const findById = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("orders").withIndex("by_orderId", q => q.eq("orderId", args.orderId)).first() || null;
  },
});

export const update = mutation({
  args: {
    userId: v.string(),
    orderId: v.string(),
    updates: v.object({
      status: v.optional(v.string()),
      shippingAddress: v.optional(v.any()),
      paymentMethod: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.query("orders")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("orderId"), args.orderId))
      .first();
    if (!order) return null;
    await ctx.db.patch(order._id, { ...args.updates, updatedAt: new Date().toISOString() });
    return { ...order, ...args.updates, updatedAt: new Date().toISOString() };
  },
});

export const findAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("orders").collect();
  },
});

export const count = query({
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    return orders.length;
  },
});