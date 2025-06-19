export interface ModelProvider {
  id: string
  codeName: string
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
  provider: "openrouter" | "google" | "openai" | "xai" | string
}

export const MODELS: ModelProvider[] = [
  // Claude
  {
    id: "anthropic/claude-3.5-sonnet",
    codeName: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    company: "Anthropic",
    description: "Most capable model for complex reasoning and analysis",
    features: { thinking: true, search: false, imageGeneration: false, vision: true, streaming: true },
    pricing: { input: 3, output: 15 },
    contextLength: 200000,
    provider: "openrouter",
  },
  {
    id: "anthropic/claude-3.5-opus",
    codeName: "claude-3.5-opus",
    name: "Claude 3.5 Opus",
    company: "Anthropic",
    description: "Claude 3.5 Opus for advanced tasks.",
    features: { thinking: true, search: false, imageGeneration: false, vision: true, streaming: true },
    pricing: { input: 8, output: 24 },
    contextLength: 200000,
    provider: "openrouter",
  },
  {
    id: "anthropic/claude-3.7-sonnet",
    codeName: "claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    company: "Anthropic",
    description: "Claude 3.7 Sonnet for advanced tasks.",
    features: { thinking: true, search: false, imageGeneration: false, vision: true, streaming: true },
    pricing: { input: 8, output: 24 },
    contextLength: 200000,
    provider: "openrouter",
  },
  {
    id: "anthropic/claude-4-opus",
    codeName: "claude-4-opus",
    name: "Claude 4 Opus",
    company: "Anthropic",
    description: "Claude 4 Opus for advanced tasks.",
    features: { thinking: true, search: false, imageGeneration: false, vision: true, streaming: true },
    pricing: { input: 15, output: 45 },
    contextLength: 200000,
    provider: "openrouter",
  },
  {
    id: "anthropic/claude-4-sonnet",
    codeName: "claude-4-sonnet",
    name: "Claude 4 Sonnet",
    company: "Anthropic",
    description: "Claude 4 Sonnet for complex tasks.",
    features: { thinking: true, search: false, imageGeneration: false, vision: true, streaming: true },
    pricing: { input: 15, output: 45 },
    contextLength: 200000,
    provider: "openrouter",
  },
  // Gemini
  {
    id: "google/gemini-2.0-flash",
    codeName: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    company: "Google",
    description: "Fast and efficient multimodal model",
    features: { thinking: false, search: true, imageGeneration: true, vision: true, streaming: true },
    pricing: { input: 0.075, output: 0.3 },
    contextLength: 1048576,
    provider: "google",
  },
  {
    id: "google/gemini-2.5-flash",
    codeName: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    company: "Google",
    description: "Gemini 2.5 Flash for fast tasks.",
    features: { thinking: false, search: true, imageGeneration: true, vision: true, streaming: true },
    pricing: { input: 0.1, output: 0.4 },
    contextLength: 1048576,
    provider: "google",
  },
  {
    id: "google/gemini-2.0-flash-lite",
    codeName: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    company: "Google",
    description: "Gemini 2.0 Flash Lite for lightweight tasks.",
    features: { thinking: false, search: true, imageGeneration: true, vision: true, streaming: true },
    pricing: { input: 0.05, output: 0.2 },
    contextLength: 1048576,
    provider: "google",
  },
  {
    id: "google/gemini-2.0-pro",
    codeName: "gemini-2.0-pro",
    name: "Gemini 2.0 Pro",
    company: "Google",
    description: "Gemini 2.0 Pro for advanced tasks.",
    features: { thinking: true, search: true, imageGeneration: true, vision: true, streaming: true },
    pricing: { input: 0.2, output: 0.8 },
    contextLength: 1048576,
    provider: "google",
  },
  // Grok
  {
    id: "xai/grok-3",
    codeName: "grok-3",
    name: "Grok 3",
    company: "xAI",
    description: "Latest Grok model with enhanced reasoning",
    features: { thinking: true, search: true, imageGeneration: false, vision: true, streaming: true },
    pricing: { input: 2, output: 10 },
    contextLength: 131072,
    provider: "openrouter",
  },
  {
    id: "xai/grok-3-mini",
    codeName: "grok-3-mini",
    name: "Grok 3 Mini",
    company: "xAI",
    description: "Grok 3 Mini for lightweight tasks.",
    features: { thinking: true, search: true, imageGeneration: false, vision: true, streaming: true },
    pricing: { input: 1, output: 5 },
    contextLength: 65536,
    provider: "openrouter",
  },
  // ChatGPT
  {
    id: "openai/gpt-4o",
    codeName: "gpt-4o",
    name: "GPT-4o",
    company: "OpenAI",
    description: "Multimodal flagship model with vision capabilities",
    features: { thinking: false, search: false, imageGeneration: false, vision: true, streaming: true },
    pricing: { input: 5, output: 15 },
    contextLength: 128000,
    provider: "openrouter",
  },
  {
    id: "openai/gpt-4",
    codeName: "gpt-4",
    name: "GPT-4",
    company: "OpenAI",
    description: "GPT-4 for advanced tasks.",
    features: { thinking: false, search: false, imageGeneration: false, vision: true, streaming: true },
    pricing: { input: 10, output: 30 },
    contextLength: 128000,
    provider: "openrouter",
  },
  {
    id: "openai/gpt-4-32k",
    codeName: "gpt-4-32k",
    name: "GPT-4 32K",
    company: "OpenAI",
    description: "GPT-4 32K context window.",
    features: { thinking: false, search: false, imageGeneration: false, vision: true, streaming: true },
    pricing: { input: 20, output: 60 },
    contextLength: 32000,
    provider: "openrouter",
  },
  {
    id: "openai/gpt-3.5-turbo",
    codeName: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    company: "OpenAI",
    description: "GPT-3.5 Turbo for fast and cheap tasks.",
    features: { thinking: false, search: false, imageGeneration: false, vision: false, streaming: true },
    pricing: { input: 0.5, output: 1.5 },
    contextLength: 16000,
    provider: "openrouter",
  },
  {
    id: "openai/gpt-3.5-turbo-16k",
    codeName: "gpt-3.5-turbo-16k",
    name: "GPT-3.5 Turbo 16K",
    company: "OpenAI",
    description: "GPT-3.5 Turbo with 16K context window.",
    features: { thinking: false, search: false, imageGeneration: false, vision: false, streaming: true },
    pricing: { input: 1, output: 2 },
    contextLength: 16000,
    provider: "openrouter",
  },
  // Add more models as needed (mini, pro, o1, o3, etc)
];

export const getAllModels = (): ModelProvider[] => MODELS;

export const getModelById = (id: string): ModelProvider | undefined => {
  return MODELS.find((model) => model.id === id);
};

export const getModelsByFeature = (feature: keyof ModelProvider["features"]): ModelProvider[] => {
  return MODELS.filter((model) => model.features[feature]);
};
