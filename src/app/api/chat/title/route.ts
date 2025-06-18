import { google } from '@ai-sdk/google'
import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'
import { generateText } from 'ai'
import { CHAT_TITLE_SYSTEM_PROMPT } from '@/lib/prompts'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const { text: title } = await generateText({
      model: google('gemini-2.0-flash'),
      providerOptions: {
        google: {
          responseModalities: ['TEXT'],
        } satisfies GoogleGenerativeAIProviderOptions,
      },
      messages: [
        { role: "system", content: CHAT_TITLE_SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
    })

    return NextResponse.json({ title: title.trim() })
  } catch (error) {
    console.error("Error generating chat title:", error)
    return NextResponse.json(
      { error: "Failed to generate chat title" },
      { status: 500 }
    )
  }
} 