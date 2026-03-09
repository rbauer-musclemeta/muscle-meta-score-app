import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertCurrentUser = mutation({
  args: {
    externalAuthId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_externalAuthId", (q) => q.eq("externalAuthId", args.externalAuthId))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        updatedAt: now
      });
      return existing._id;
    }

    return ctx.db.insert("users", {
      externalAuthId: args.externalAuthId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      marketingOptIn: false,
      status: "active",
      createdAt: now,
      updatedAt: now
    });
  }
});

export const getUserByExternalAuthId = query({
  args: {
    externalAuthId: v.string()
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_externalAuthId", (q) => q.eq("externalAuthId", args.externalAuthId))
      .unique();
  }
});