import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { paginationOptsValidator } from "convex/server"

export const create = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const chatId = await ctx.db.insert("chats", {
      userId: args.userId,
      title: args.title,
      modelId: args.modelId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return chatId
  },
})

export const createFromExisting = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    modelId: v.string(),
    sourceChatId: v.id("chats"),
    upToMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    // Create new chat
    const chatId = await ctx.db.insert("chats", {
      userId: args.userId,
      title: args.title,
      modelId: args.modelId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Get messages from source chat up to the specified message
    const sourceMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.sourceChatId))
      .order("asc")
      .collect()

    let messagesToCopy = sourceMessages
    if (args.upToMessageId) {
      const upToIndex = sourceMessages.findIndex(m => m._id === args.upToMessageId)
      if (upToIndex !== -1) {
        messagesToCopy = sourceMessages.slice(0, upToIndex + 1)
      }
    }

    // Copy messages to new chat
    for (const message of messagesToCopy) {
      await ctx.db.insert("messages", {
        chatId,
        userId: message.userId,
        role: message.role,
        content: message.content,
        modelId: message.modelId,
        attachments: message.attachments,
        metadata: message.metadata,
        createdAt: Date.now(),
      })
    }

    return chatId
  },
})

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect()
  },
})

export const listPaginated = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const get = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatId)
  },
})

export const updateTitle = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chatId, {
      title: args.title,
      updatedAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect()

    for (const message of messages) {
      await ctx.db.delete(message._id)
    }

    // Delete the chat
    await ctx.db.delete(args.chatId)
  },
})

export const getMessagesUpTo = query({
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
    if (targetIndex === -1) return []

    return allMessages.slice(0, targetIndex + 1)
  },
})
