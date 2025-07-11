import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  chats: defineTable({
    userId: v.string(),
    title: v.string(),
    modelId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_updated", ["updatedAt"]),

  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.string(),
    role: v.string(),
    content: v.string(),
    modelId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("thinking"), v.literal("generating"), v.literal("searching"), v.literal("sent"))),
    metadata: v.optional(
      v.object({
        searchUsed: v.boolean(),
        thinkingUsed: v.boolean(),
        searchResults: v.optional(v.array(v.string())),
        thinkingContent: v.optional(v.string()),
        tokensUsed: v.optional(v.number()),
      })
    ),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.string(),
          storageId: v.string(),
        })
      )
    ),
    createdAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_user", ["userId"]),

  files: defineTable({
    userId: v.string(),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
})
