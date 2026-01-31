import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("heartbeatConfig").first();
    return config;
  },
});

export const updateConfig = mutation({
  args: {
    start_date: v.string(),
  },
  handler: async (ctx, args) => {
    const existingConfig = await ctx.db.query("heartbeatConfig").first();

    if (existingConfig) {
      await ctx.db.patch(existingConfig._id, {
        start_date: args.start_date,
      });
      return await ctx.db.get(existingConfig._id);
    } else {
      const id = await ctx.db.insert("heartbeatConfig", {
        start_date: args.start_date,
      });
      return await ctx.db.get(id);
    }
  },
});
