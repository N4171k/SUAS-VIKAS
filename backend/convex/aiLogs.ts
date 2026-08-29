import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    query: v.optional(v.string()),
    responseSnippet: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    intent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const logId = uuidv4();
    const now = new Date().toISOString();
    await ctx.db.insert("aiLogs", {
      logId,
      userId: args.userId || "anonymous",
      createdAt: now,
      query: args.query || null,
      responseSnippet: args.responseSnippet || null,
      latencyMs: args.latencyMs || null,
      intent: args.intent || null,
    });
    return { logId, ...args, userId: args.userId || "anonymous", createdAt: now };
  },
});

export const findByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("aiLogs").withIndex("by_user", q => q.eq("userId", args.userId)).collect();
  },
});