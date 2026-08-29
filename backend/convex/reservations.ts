import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

export const create = mutation({
  args: {
    userId: v.string(),
    productId: v.string(),
    storeId: v.string(),
    quantity: v.number(),
    slot: v.optional(v.string()),
    status: v.optional(v.string()),
    price: v.optional(v.number()),
    productImage: v.optional(v.string()),
    productName: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reservationId = `res_${uuidv4()}`;
    const now = new Date().toISOString();
    await ctx.db.insert("reservations", {
      reservationId,
      userId: args.userId,
      productId: args.productId,
      storeId: args.storeId,
      quantity: args.quantity,
      slotTime: args.slot || null,
      status: args.status || "pending",
      price: args.price || null,
      productImage: args.productImage || null,
      productName: args.productName || null,
      expiresAt: args.expiresAt || null,
      createdAt: now,
      updatedAt: now,
    });
    return { reservationId, ...args, createdAt: now, updatedAt: now };
  },
});

export const findById = query({
  args: { reservationId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("reservations").filter(q => q.eq(q.field("reservationId"), args.reservationId)).first() || null;
  },
});

export const findByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("reservations").withIndex("by_user", q => q.eq("userId", args.userId)).collect();
  },
});

export const findByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("reservations").withIndex("by_store", q => q.eq("storeId", args.storeId)).collect();
  },
});

export const update = mutation({
  args: {
    reservationId: v.string(),
    updates: v.object({
      status: v.optional(v.string()),
      price: v.optional(v.number()),
      productImage: v.optional(v.string()),
      productName: v.optional(v.string()),
      expiresAt: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.query("reservations").filter(q => q.eq(q.field("reservationId"), args.reservationId)).first();
    if (!reservation) return null;
    await ctx.db.patch(reservation._id, { ...args.updates, updatedAt: new Date().toISOString() });
    return { ...reservation, ...args.updates, updatedAt: new Date().toISOString() };
  },
});

export const findAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("reservations").collect();
  },
});

export const count = query({
  handler: async (ctx) => {
    const reservations = await ctx.db.query("reservations").collect();
    return reservations.length;
  },
});