import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    display_name: v.string(),
    password_hash: v.string(),
  }).index("by_name", ["name"]),

  albums: defineTable({
    name: v.string(),
    date: v.optional(v.string()),
    location: v.optional(v.string()),
    created_at: v.number(),
  }),

  photos: defineTable({
    album_id: v.id("albums"),
    storage_id: v.id("_storage"),
    caption: v.optional(v.string()),
    order: v.number(),
    width: v.number(),
    height: v.number(),
  }).index("by_album", ["album_id"]),
});
