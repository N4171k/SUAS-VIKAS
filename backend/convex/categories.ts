import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

export const create = mutation({
  args: {
    name: v.string(),
    subCategories: v.optional(v.array(v.string())),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const categoryId = `cat_${uuidv4().replace(/-/g, "")}`;
    const now = new Date().toISOString();
    await ctx.db.insert("categories", {
      categoryId,
      name: args.name,
      subCategories: args.subCategories || [],
      type: args.type || "CATEGORY",
      updatedAt: now,
    });
    return { categoryId, ...args, subCategories: args.subCategories || [], type: args.type || "CATEGORY", updatedAt: now };
  },
});

export const findById = query({
  args: { categoryId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("categories").filter(q => q.eq(q.field("categoryId"), args.categoryId)).first() || null;
  },
});

export const findByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("categories").collect();
    const found = items.find(it => (it.name || "").toLowerCase() === args.name.toLowerCase());
    return found || null;
  },
});

export const findAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const update = mutation({
  args: {
    categoryId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      subCategories: v.optional(v.array(v.string())),
      type: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.query("categories").filter(q => q.eq(q.field("categoryId"), args.categoryId)).first();
    if (!category) return null;
    await ctx.db.patch(category._id, { ...args.updates, updatedAt: new Date().toISOString() });
    return { ...category, ...args.updates, updatedAt: new Date().toISOString() };
  },
});