import { useChat as useVercelChat } from "@ai-sdk/react"
import { useState, useCallback } from "react"
import { ModelProvider } from "@/lib/models"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"

interface UseChatOptions {
  initialModelId?: string
  onError?: (error: Error) => void
  chatId?: Id<"chats">
}

export function useChat({ initialModelId = "google/gemini-2.0-flash", onError, chatId }: UseChatOptions = {}) {
  const { isSignedIn = false, user } = useUser()
  const router = useRouter()
  const [selectedModelId, setSelectedModelId] = useState(initialModelId)
  const [useSearch, setUseSearch] = useState(false)
  const [useThinking, setUseThinking] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])

  const createChat = useMutation(api.chats.create)
  const createMessage = useMutation(api.messages.create)
  const updateMessage = useMutation(api.messages.update)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleVercelSubmit,
    isLoading,
    error,
  } = useVercelChat({
    api: "/api/chat",
    body: {
      chatId,
      userId: user?.id,
      modelId: selectedModelId,
      useSearch,
      useThinking,
    },
    onError,
  })

  const generateChatTitle = async (message: string) => {
    try {
      const response = await fetch("/api/chat/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) throw new Error("Failed to generate title")
      const { title } = await response.json()
      return title
    } catch (error) {
      console.error("Error generating chat title:", error)
      return "New Chat"
    }
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      if (!input.trim()) return

      if (isSignedIn && user) {
        let currentChatId = chatId

        // If no chat is selected, create a new one with generated title
        if (!currentChatId) {
          const title = await generateChatTitle(input)
          currentChatId = await createChat({
            userId: user.id,
            title,
            modelId: selectedModelId,
          })
          router.push(`/chat/${currentChatId}`)
        }

        // Add user message
        await createMessage({
          chatId: currentChatId,
          userId: user.id,
          role: "user",
          content: input,
          attachments: attachments.map((f) => f.name),
        })

        // Submit to Vercel AI SDK
        handleVercelSubmit(e)
        setAttachments([])
      } else {
        // For non-authenticated users, just use Vercel AI SDK
        handleVercelSubmit(e)
      }
    },
    [input, isSignedIn, chatId, user, attachments, createMessage, createChat, handleVercelSubmit, selectedModelId, router]
  )

  const handleFileSelect = useCallback((files: File[]) => {
    setAttachments((prev) => [...prev, ...files])
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearAttachments = useCallback(() => {
    setAttachments([])
  }, [])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    selectedModelId,
    setSelectedModelId,
    useSearch,
    setUseSearch,
    useThinking,
    setUseThinking,
    attachments,
    handleFileSelect,
    removeAttachment,
    clearAttachments,
    isSignedIn,
  }
} 