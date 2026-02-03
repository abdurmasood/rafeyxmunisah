import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByAlbum = query({
  args: { album_id: v.id("albums") },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_album", (q) => q.eq("album_id", args.album_id))
      .collect();

    // Sort by order and add URLs
    const sorted = photos.sort((a, b) => a.order - b.order);

    return Promise.all(
      sorted.map(async (photo) => ({
        ...photo,
        url: await ctx.storage.getUrl(photo.storage_id),
      }))
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    album_id: v.id("albums"),
    storage_id: v.id("_storage"),
    width: v.number(),
    height: v.number(),
  },
  handler: async (ctx, args) => {
    // Get current max order in album
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_album", (q) => q.eq("album_id", args.album_id))
      .collect();

    const maxOrder = photos.length > 0
      ? Math.max(...photos.map(p => p.order))
      : -1;

    const photoId = await ctx.db.insert("photos", {
      album_id: args.album_id,
      storage_id: args.storage_id,
      order: maxOrder + 1,
      width: args.width,
      height: args.height,
    });

    return photoId;
  },
});

export const updateCaption = mutation({
  args: {
    id: v.id("photos"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { caption: args.caption });
  },
});

export const remove = mutation({
  args: { id: v.id("photos") },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.id);
    if (photo) {
      await ctx.storage.delete(photo.storage_id);
      await ctx.db.delete(args.id);
    }
  },
});
