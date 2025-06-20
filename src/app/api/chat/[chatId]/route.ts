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
    const { messages, modelId, useSearch, useThinking, apiKeys } = await req.json()
    const chatId = (await params).chatId as Id<'chats'>
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "User is not authenticated" }, { status: 401 })
    }

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 })
    }

    // Find the model info
    const model = MODELS.find(m => m.id === modelId) || MODELS.find(m => m.id === 'google/gemini-2.0-flash')
    let modelFn: any = google
    let providerOptions: any = {}
    let apiKey: string | undefined
    
    if (model) {
      switch (model.provider) {
        case 'google':
          modelFn = google
          apiKey = apiKeys?.google || process.env.GOOGLE_API_KEY
          providerOptions = {
            google: {
              responseModalities: ['TEXT'],
              // Enable search for Google models that support it
              ...(useSearch && model.features.search && {
                search: true,
              }),
              // Enable thinking for Google models that support it
              ...(useThinking && model.features.thinking && {
                thinking: true,
              }),
            } satisfies GoogleGenerativeAIProviderOptions,
          }
          break
        case 'openai':
          modelFn = openai
          providerOptions = {
            openai: {
              apiKey: apiKeys?.openai || process.env.OPENAI_API_KEY,
            },
          }
          break
        case 'anthropic':
          modelFn = anthropic
          providerOptions = {
            anthropic: {
              apiKey: apiKeys?.anthropic || process.env.ANTHROPIC_API_KEY,
              // Enable thinking for Anthropic models that support it
              ...(useThinking && model.features.thinking && {
                thinking: true,
              }),
            },
          }
          break
        case 'xai':
          modelFn = xai
          providerOptions = {
            xai: {
              apiKey: apiKeys?.xai || process.env.XAI_API_KEY,
              // Enable search for xAI models that support it
              ...(useSearch && model.features.search && {
                search: true,
              }),
              // Enable thinking for xAI models that support it
              ...(useThinking && model.features.thinking && {
                thinking: true,
              }),
            },
          }
          break
        case 'openrouter':
          // OpenRouter can proxy to multiple providers, use openai/anthropic/xai as needed
          if (model.id.startsWith('openai/')) {
            modelFn = openai
            providerOptions = { 
              openai: {
                apiKey: apiKeys?.openrouter || process.env.OPENROUTER_API_KEY,
                baseURL: "https://openrouter.ai/api/v1",
              }
            }
          } else if (model.id.startsWith('anthropic/')) {
            modelFn = anthropic
            providerOptions = { 
              anthropic: {
                apiKey: apiKeys?.openrouter || process.env.OPENROUTER_API_KEY,
                baseURL: "https://openrouter.ai/api/v1",
                // Enable thinking for Anthropic models through OpenRouter
                ...(useThinking && model.features.thinking && {
                  thinking: true,
                }),
              }
            }
          } else if (model.id.startsWith('xai/')) {
            modelFn = xai
            providerOptions = { 
              xai: {
                apiKey: apiKeys?.openrouter || process.env.OPENROUTER_API_KEY,
                baseURL: "https://openrouter.ai/api/v1",
                // Enable search and thinking for xAI models through OpenRouter
                ...(useSearch && model.features.search && {
                  search: true,
                }),
                ...(useThinking && model.features.thinking && {
                  thinking: true,
                }),
              }
            }
          } else if (model.id.startsWith('google/')) {
            modelFn = google
            apiKey = apiKeys?.openrouter || process.env.OPENROUTER_API_KEY
            providerOptions = {
              google: {
                responseModalities: ['TEXT'],
                // Enable search and thinking for Google models through OpenRouter
                ...(useSearch && model.features.search && {
                  search: true,
                }),
                ...(useThinking && model.features.thinking && {
                  thinking: true,
                }),
              } satisfies GoogleGenerativeAIProviderOptions,
            }
          }
          break
        default:
          modelFn = google
          apiKey = apiKeys?.google || process.env.GOOGLE_API_KEY
          providerOptions = {
            google: {
              responseModalities: ['TEXT'],
            } satisfies GoogleGenerativeAIProviderOptions,
          }
      }
    }

    // Prepare messages with thinking/search instructions if needed
    let processedMessages = (messages as Message[]).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    // Add thinking/search instructions to the last user message if the model doesn't have built-in support
    if ((useThinking && !model?.features.thinking) || (useSearch && !model?.features.search)) {
      const lastUserMessage = processedMessages.findLast(m => m.role === 'user')
      if (lastUserMessage) {
        let enhancedContent = lastUserMessage.content
        
        if (useThinking && !model?.features.thinking) {
          enhancedContent += "\n\nPlease show your thinking process step by step before providing the final answer."
        }
        
        if (useSearch && !model?.features.search) {
          enhancedContent += "\n\nPlease search for relevant information and cite your sources."
        }
        
        lastUserMessage.content = enhancedContent
      }
    }

    // Create assistant message in Convex
    const assistantMessageId = await fetchMutation(api.messages.create, {
      chatId,
      userId,
      role: "assistant",
      content: "",
      modelId,
      status: useThinking && model?.features.thinking ? "thinking" : 
              useSearch && model?.features.search ? "searching" : "generating",
      metadata: {
        searchUsed: useSearch,
        thinkingUsed: useThinking,
      },
    })

    const result = streamText({
      model: model && modelFn(model.codeName, { apiKey }),
      messages: processedMessages,
      providerOptions,
      async onFinish({ response }) {
        // Update the assistant message with the final content
        const content = response.messages[0].content
        const contentString = Array.isArray(content) 
          ? content.map(part => part.type === 'text' ? part.text : '').join('')
          : String(content)
        
        // Extract thinking and search data from the response if not handled by the model
        let finalContent = contentString
        let thinkingContent: string | undefined
        let searchResults: string[] | undefined
        
        if (useThinking && !model?.features.thinking) {
          // Extract thinking content (everything before the final answer)
          const thinkingMatch = contentString.match(/(?:thinking|reasoning|analysis|process)[:\s]*([\s\S]*?)(?=\n\n(?:final|answer|conclusion|therefore)|$)/i)
          if (thinkingMatch) {
            thinkingContent = thinkingMatch[1].trim()
            // Remove thinking content from final response
            finalContent = contentString.replace(thinkingMatch[0], '').trim()
          }
        }
        
        if (useSearch && !model?.features.search) {
          // Extract search results (look for citations, sources, or search results)
          const searchMatches = contentString.match(/(?:source|reference|citation|search result)[:\s]*([^\n]+)/gi)
          if (searchMatches && searchMatches.length > 0) {
            searchResults = searchMatches.map(match => 
              match.replace(/(?:source|reference|citation|search result)[:\s]*/i, '').trim()
            )
          }
        }
        
        await fetchMutation(api.messages.update, {
          messageId: assistantMessageId,
          content: finalContent,
          status: "sent",
          metadata: {
            searchUsed: useSearch,
            thinkingUsed: useThinking,
            searchResults,
            thinkingContent,
          },
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