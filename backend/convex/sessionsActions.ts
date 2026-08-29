import { action } from "./_generated/server";
import { v } from "convex/values";

const hashToken = (token: string): string => {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
};

export const create = action({
  args: {
    userId: v.string(),
    token: v.string(),
    expiresAt: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = hashToken(args.token);
    const now = new Date().toISOString();
    await ctx.runMutation((ctx) => {
      return ctx.db.insert("sessions", {
        sessionId,
        userId: args.userId,
        token: args.token,
        expiresAt: args.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: args.ipAddress || null,
        userAgent: args.userAgent || null,
        isActive: true,
        createdAt: now,
      });
    });
    return { sessionId, ...args, expiresAt: args.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), isActive: true, createdAt: now };
  },
});

export const deactivateByUserAndToken = action({
  args: { userId: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    const sessionId = hashToken(args.token);
    const result = await ctx.runQuery((ctx) => {
      return ctx.db.query("sessions").filter(q => q.eq(q.field("sessionId"), sessionId)).first();
    });
    if (!result || result.userId !== args.userId) return null;
    await ctx.runMutation((ctx) => {
      return ctx.db.patch(result._id, { isActive: false, updatedAt: new Date().toISOString() });
    });
    return { ...result, isActive: false, updatedAt: new Date().toISOString() };
  },
});