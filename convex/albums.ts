import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const albums = await ctx.db
      .query("albums")
      .order("desc")
      .collect();
    return albums;
  },
});

export const get = query({
  args: { id: v.id("albums") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const albumId = await ctx.db.insert("albums", {
      name: args.name,
      created_at: Date.now(),
    });
    return albumId;
  },
});

export const update = mutation({
  args: {
    id: v.id("albums"),
    name: v.optional(v.string()),
    date: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("albums") },
  handler: async (ctx, args) => {
    // Delete all photos in the album first
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_album", (q) => q.eq("album_id", args.id))
      .collect();

    for (const photo of photos) {
      await ctx.storage.delete(photo.storage_id);
      await ctx.db.delete(photo._id);
    }

    await ctx.db.delete(args.id);
  },
});
