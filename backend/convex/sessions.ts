import { query } from "./_generated/server";
import { v } from "convex/values";

const hashToken = (token: string) => {
  // This is a placeholder - actual hashing is done in sessionsActions.ts
  // For queries, we need the token to be pre-hashed by the caller
  return token;
};

export const findByToken = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("sessions").filter(q => q.eq(q.field("sessionId"), args.sessionId)).first() || null;
  },
});

export const findActiveByUserAndToken = query({
  args: { userId: v.string(), sessionId: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db.query("sessions").filter(q => q.eq(q.field("sessionId"), args.sessionId)).first();
    if (!item || item.userId !== args.userId || item.isActive === false) return null;
    if (item.expiresAt && new Date(item.expiresAt) < new Date()) return null;
    return item;
  },
});

export const findByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("sessions").withIndex("by_user", q => q.eq("userId", args.userId)).collect();
  },
});