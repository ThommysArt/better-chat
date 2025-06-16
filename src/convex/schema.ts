import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  chats: defineTable({
    userId: v.string(),
    title: v.string(),
    modelId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    modelId: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())), // File Urls
    metadata: v.optional(
      v.object({
        searchUsed: v.optional(v.boolean()),
        thinkingUsed: v.optional(v.boolean()),
        tokensUsed: v.optional(v.number()),
      }),
    ),
    createdAt: v.number(),
  }).index("by_chat", ["chatId"]),

  files: defineTable({
    userId: v.string(),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
})
