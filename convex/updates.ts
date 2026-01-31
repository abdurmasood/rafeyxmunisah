import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const updates = await ctx.db
      .query("updates")
      .order("desc")
      .take(100);

    // Fetch user data for each update
    const updatesWithUsers = await Promise.all(
      updates.map(async (update) => {
        const user = await ctx.db.get(update.user_id);
        return {
          ...update,
          users: user
            ? {
                _id: user._id,
                name: user.name,
                display_name: user.display_name,
              }
            : null,
        };
      })
    );

    return updatesWithUsers;
  },
});

export const create = mutation({
  args: {
    user_id: v.id("users"),
    content: v.string(),
    emotion_type: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updateId = await ctx.db.insert("updates", {
      user_id: args.user_id,
      content: args.content,
      emotion_type: args.emotion_type,
      timestamp,
      is_read: false,
    });

    const update = await ctx.db.get(updateId);
    const user = await ctx.db.get(args.user_id);

    return {
      ...update,
      users: user
        ? {
            _id: user._id,
            name: user.name,
            display_name: user.display_name,
          }
        : null,
    };
  },
});

export const markAsRead = mutation({
  args: {
    updateIds: v.array(v.id("updates")),
  },
  handler: async (ctx, args) => {
    for (const id of args.updateIds) {
      await ctx.db.patch(id, { is_read: true });
    }
    return { success: true };
  },
});
