import { mutation } from "./_generated/server"
import { ConvexError } from "convex/values"
import { v } from "convex/values"

export const generateUploadUrl = mutation({
  args: {
    name: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate a storage ID for the file
    return await ctx.storage.generateUploadUrl()
  },
})

export const getDownloadUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Generate a download URL for the file
    return await ctx.storage.getUrl(args.storageId)
  },
}) 