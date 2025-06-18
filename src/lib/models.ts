export interface ModelProvider {
  id: string
  name: string
  company: string
  description: string
  features: {
    thinking: boolean
    search: boolean
    imageGeneration: boolean
    vision: boolean
    streaming: boolean
  }
  pricing: {
    input: number // per 1M tokens
    output: number // per 1M tokens
  }
  contextLength: number
  apiEndpoint?: string
  provider: "openrouter" | "google"
}

export const MODEL_PROVIDERS: Record<string, ModelProvider[]> = {
  openrouter: [
    {
      id: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      company: "Anthropic",
      description: "Most capable model for complex reasoning and analysis",
      features: {
        thinking: true,
        search: false,
        imageGeneration: false,
        vision: true,
        streaming: true,
      },
      pricing: { input: 3, output: 15 },
      contextLength: 200000,
      provider: "openrouter",
    },
    {
      id: "openai/gpt-4o",
      name: "GPT-4o",
      company: "OpenAI",
      description: "Multimodal flagship model with vision capabilities",
      features: {
        thinking: false,
        search: false,
        imageGeneration: false,
        vision: true,
        streaming: true,
      },
      pricing: { input: 5, output: 15 },
      contextLength: 128000,
      provider: "openrouter",
    },
    {
      id: "x-ai/grok-3",
      name: "Grok 3",
      company: "xAI",
      description: "Latest Grok model with enhanced reasoning",
      features: {
        thinking: true,
        search: true,
        imageGeneration: false,
        vision: true,
        streaming: true,
      },
      pricing: { input: 2, output: 10 },
      contextLength: 131072,
      provider: "openrouter",
    },
    {
      id: "openrouter/gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      company: "Google",
      description: "Fast and efficient multimodal model",
      features: {
        thinking: false,
        search: true,
        imageGeneration: true,
        vision: true,
        streaming: true,
      },
      pricing: { input: 0.075, output: 0.3 },
      contextLength: 1048576,
      provider: "openrouter",
    },
  ],
  google: [
    {
      id: "google/gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      company: "Google",
      description: "Fast and efficient multimodal model",
      features: {
        thinking: false,
        search: true,
        imageGeneration: true,
        vision: true,
        streaming: true,
      },
      pricing: { input: 0.075, output: 0.3 },
      contextLength: 1048576,
      provider: "google",
    },
  ]
}

export const getAllModels = (): ModelProvider[] => {
  return Object.values(MODEL_PROVIDERS).flat()
}

export const getModelById = (id: string): ModelProvider | undefined => {
  return getAllModels().find((model) => model.id === id)
}

export const getModelsByFeature = (feature: keyof ModelProvider["features"]): ModelProvider[] => {
  return getAllModels().filter((model) => model.features[feature])
}
