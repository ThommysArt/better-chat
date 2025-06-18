import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'
import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { NextResponse } from 'next/server'
import type { Message } from 'ai'

export async function POST(req: Request) {
  try {
    const { messages, modelId, useSearch, useThinking, chatId, userId } = await req.json()

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }
    // Create assistant message in Convex
    const assistantMessageId = await fetchMutation(api.messages.create, {
      chatId,
      userId,
      role: "assistant",
      content: "",
      modelId,
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
