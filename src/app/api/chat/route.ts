import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import type { NextRequest } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages, modelId, useSearch, useThinking, apiKey } = await req.json()

    // Use user's API key if provided, otherwise use server key
    const client = openai({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey || process.env.OPENROUTER_API_KEY,
    })

    // Map our model IDs to OpenRouter format
    const modelMap: Record<string, string> = {
      "google/gemini-2.0-flash-exp": "google/gemini-2.0-flash-exp",
      "anthropic/claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
      "openai/gpt-4o": "openai/gpt-4o",
      "x-ai/grok-3": "x-ai/grok-beta",
    }

    const actualModelId = modelMap[modelId] || "google/gemini-2.0-flash-exp"

    let systemPrompt = "You are a helpful AI assistant."

    if (useThinking) {
      systemPrompt += " Think step by step and show your reasoning process."
    }

    if (useSearch) {
      systemPrompt += " You can search for current information when needed."
    }

    const result = streamText({
      model: client(actualModelId),
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      maxTokens: 4000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
