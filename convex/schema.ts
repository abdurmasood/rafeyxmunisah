import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    display_name: v.string(),
    password_hash: v.string(),
  }).index("by_name", ["name"]),

  updates: defineTable({
    user_id: v.id("users"),
    content: v.string(),
    emotion_type: v.string(),
    timestamp: v.string(),
    is_read: v.boolean(),
  }),

  heartbeatConfig: defineTable({
    start_date: v.string(),
  }),
});
