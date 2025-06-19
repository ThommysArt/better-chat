import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { xai } from '@ai-sdk/xai'
import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'
import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { NextResponse } from 'next/server'
import type { Message } from 'ai'
import type { NextRequest } from 'next/server'
import type { Id } from '@/convex/_generated/dataModel'
import { auth } from '@clerk/nextjs/server'
import { MODELS } from '@/lib/models'

export async function POST(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { messages, modelId, useSearch, useThinking } = await req.json()
    const chatId = (await params).chatId as Id<'chats'>
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "User is not authenticated" }, { status: 401 })
    }

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

    // Find the model info
    const model = MODELS.find(m => m.id === modelId) || MODELS.find(m => m.id === 'google/gemini-2.0-flash')
    let modelFn: any = google
    let providerOptions: any = {}
    if (model) {
      switch (model.provider) {
        case 'google':
          modelFn = google
          providerOptions = {
            google: {
              responseModalities: ['TEXT'],
            } satisfies GoogleGenerativeAIProviderOptions,
          }
          break
        case 'openai':
          modelFn = openai
          providerOptions = {
            openai: {},
          }
          break
        case 'anthropic':
          modelFn = anthropic
          providerOptions = {
            anthropic: {},
          }
          break
        case 'xai':
          modelFn = xai
          providerOptions = {
            xai: {},
          }
          break
        case 'openrouter':
          // OpenRouter can proxy to multiple providers, use openai/anthropic/xai as needed
          if (model.id.startsWith('openai/')) {
            modelFn = openai
            providerOptions = { openai: {} }
          } else if (model.id.startsWith('anthropic/')) {
            modelFn = anthropic
            providerOptions = { anthropic: {} }
          } else if (model.id.startsWith('xai/')) {
            modelFn = xai
            providerOptions = { xai: {} }
          } else if (model.id.startsWith('google/')) {
            modelFn = google
            providerOptions = {
              google: {
                responseModalities: ['TEXT'],
              } satisfies GoogleGenerativeAIProviderOptions,
            }
          }
          break
        default:
          modelFn = google
          providerOptions = {
            google: {
              responseModalities: ['TEXT'],
            } satisfies GoogleGenerativeAIProviderOptions,
          }
      }
    }

    const result = streamText({
      model: model && modelFn(model.codeName),
      messages: messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
      providerOptions,
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