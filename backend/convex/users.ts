import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password_hash: v.string(),
    role: v.optional(v.string()),
    avatar: v.optional(v.string()),
    gender: v.optional(v.string()),
    clothing_size: v.optional(v.string()),
    footwear_size: v.optional(v.string()),
    favourite_colors: v.optional(v.array(v.string())),
    style_preferences: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = uuidv4();
    const now = new Date().toISOString();
    const userData = {
      userId,
      name: args.name,
      email: args.email,
      password_hash: args.password_hash,
      role: args.role || "customer",
      createdAt: now,
      updatedAt: now,
    };
    if (args.avatar !== undefined) userData.avatar = args.avatar;
    if (args.gender !== undefined) userData.gender = args.gender;
    if (args.clothing_size !== undefined) userData.clothing_size = args.clothing_size;
    if (args.footwear_size !== undefined) userData.footwear_size = args.footwear_size;
    if (args.favourite_colors !== undefined) userData.favourite_colors = args.favourite_colors;
    if (args.style_preferences !== undefined) userData.style_preferences = args.style_preferences;
    await ctx.db.insert("users", userData);
    return { userId, ...args, createdAt: now, updatedAt: now };
  },
});

export const findById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").filter(q => q.eq(q.field("userId"), args.userId)).first();
    return user || null;
  },
});

export const findByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).first();
    return user || null;
  },
});

export const update = mutation({
  args: {
    userId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      password_hash: v.optional(v.string()),
      role: v.optional(v.string()),
      avatar: v.optional(v.string()),
      gender: v.optional(v.string()),
      clothing_size: v.optional(v.string()),
      footwear_size: v.optional(v.string()),
      favourite_colors: v.optional(v.array(v.string())),
      style_preferences: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").filter(q => q.eq(q.field("userId"), args.userId)).first();
    if (!user) return null;
    const updateData = { updatedAt: new Date().toISOString() };
    for (const [key, value] of Object.entries(args.updates)) {
      if (value !== undefined) updateData[key] = value;
    }
    await ctx.db.patch(user._id, updateData);
    return { ...user, ...args.updates, updatedAt: new Date().toISOString() };
  },
});

export const count = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect().then(users => users.length);
  },
});