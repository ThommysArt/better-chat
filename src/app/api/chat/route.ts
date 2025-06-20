import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'
import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { NextResponse } from 'next/server'
import type { Message } from 'ai'
import type { NextRequest } from 'next/server'
import { Id } from '@/convex/_generated/dataModel'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { messages, modelId, useSearch, useThinking, userId } = await req.json()
    const chatId = params.chatId as Id<"chats">
    const { userId: authUserId } = await auth()

    if (!authUserId) {
      return NextResponse.json({ error: "User is not authenticated" }, { status: 401 })
    }

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }
    // Create assistant message in Convex
    const assistantMessageId = await fetchMutation(api.messages.create, {
      chatId,
      userId: authUserId,
      role: "assistant",
      content: "",
      modelId,
      status: "generating",
      metadata: {
        searchUsed: useSearch,
        thinkingUsed: useThinking,
      },
    })

    const result = streamText({
      model: google('gemini-2.0-flash'),
      messages: messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
      providerOptions: {
        google: {
          responseModalities: ['TEXT'],
        } satisfies GoogleGenerativeAIProviderOptions,
      },
      async onFinish({ response }) {
        // Update the assistant message with the final content
        const content = response.messages[0].content
        const contentString = Array.isArray(content) 
          ? content.map(part => part.type === 'text' ? part.text : '').join('')
          : String(content)
        
        await fetchMutation(api.messages.update, {
          messageId: assistantMessageId,
          content: contentString,
          status: "sent",
        })
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    )
  }
}
