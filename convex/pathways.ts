import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const assignPathway = mutation({
  args: {
    resultId: v.id("surveyResults"),
    userId: v.optional(v.id("users")),
    pathwayKey: v.string(),
    pathwayLabel: v.string(),
    pathwayType: v.union(
      v.literal("standard"),
      v.literal("watch"),
      v.literal("active_recovery"),
      v.literal("high_risk")
    ),
    driverKey: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("userPathways", {
      ...args,
      priorityRank: 1,
      createdAt: Date.now()
    });
  }
});

export const getCurrentPathwaysForUser = query({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("userPathways")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);
  }
});