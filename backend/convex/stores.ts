import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    storeId: v.string(),
    name: v.string(),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    hours: v.optional(v.object({ open: v.string(), close: v.string() })),
    capacityPerSlot: v.optional(v.number()),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.insert("stores", {
      storeId: args.storeId,
      name: args.name,
      city: args.city || null,
      address: args.address || null,
      latitude: args.latitude || null,
      longitude: args.longitude || null,
      hours: args.hours || { open: "09:00", close: "21:00" },
      capacityPerSlot: args.capacityPerSlot || 10,
      is_active: args.is_active !== undefined ? args.is_active : true,
      updatedAt: now,
    });
    return { ...args, updatedAt: now };
  },
});

export const findById = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    const store = await ctx.db.query("stores").filter(q => q.eq(q.field("storeId"), args.storeId)).first();
    return store || null;
  },
});

export const findAll = query({
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    return stores.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const update = mutation({
  args: {
    storeId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      city: v.optional(v.string()),
      address: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      hours: v.optional(v.object({ open: v.string(), close: v.string() })),
      capacityPerSlot: v.optional(v.number()),
      is_active: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.query("stores").filter(q => q.eq(q.field("storeId"), args.storeId)).first();
    if (!store) return null;
    await ctx.db.patch(store._id, { ...args.updates, updatedAt: new Date().toISOString() });
    return { ...store, ...args.updates, updatedAt: new Date().toISOString() };
  },
});