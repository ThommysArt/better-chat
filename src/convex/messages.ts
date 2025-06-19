import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.string(),
    role: v.string(),
    content: v.string(),
    modelId: v.optional(v.string()),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.string(),
          storageId: v.string(),
        })
      )
    ),
    metadata: v.optional(
      v.object({
        searchUsed: v.boolean(),
        thinkingUsed: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      modelId: args.modelId,
      attachments: args.attachments,
      metadata: args.metadata,
      createdAt: Date.now(),
    })

    // Update chat's updatedAt timestamp
    await ctx.db.patch(args.chatId, {
      updatedAt: Date.now(),
    })

    return messageId
  },
})

export const list = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect()
  },
})

export const get = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId)
  },
})

export const update = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
    })
  },
})

export const deleteAfter = mutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect()

    const targetIndex = allMessages.findIndex(m => m._id === args.messageId)
    if (targetIndex === -1) return

    // Delete all messages after the target message
    const messagesToDelete = allMessages.slice(targetIndex + 1)
    for (const message of messagesToDelete) {
      await ctx.db.delete(message._id)
    }

    // Update chat's updatedAt timestamp
    await ctx.db.patch(args.chatId, {
      updatedAt: Date.now(),
    })
  },
})

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId)
  },
})
