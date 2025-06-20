import { useChat as useVercelChat } from "@ai-sdk/react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { ModelProvider, getModelById } from "@/lib/models"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

interface UseChatOptions {
  initialModelId?: string
  onError?: (error: Error) => void
  chatId?: Id<"chats">
}

interface Attachment {
  name: string
  type: string
  storageId: string
}

export function useChat({ initialModelId = "google/gemini-2.0-flash", onError, chatId }: UseChatOptions = {}) {
  const { isSignedIn = false, user } = useUser()
  const router = useRouter()
  const params = useParams<{ chatId: string }>()
  const [selectedModelId, setSelectedModelId] = useState(initialModelId)
  const [useSearch, setUseSearch] = useState(false)
  const [useThinking, setUseThinking] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [streamingContent, setStreamingContent] = useState("")
  const [streamingStatus, setStreamingStatus] = useState<'thinking' | 'searching' | 'generating' | 'complete'>('generating')

  const createChat = useMutation(api.chats.create)
  const createMessage = useMutation(api.messages.create)
  const updateMessage = useMutation(api.messages.update)

  // Get the current chatId from params or props
  const currentChatId = params.chatId as Id<"chats"> || chatId

  // Reset search and thinking flags when model changes to one that doesn't support them
  useEffect(() => {
    const model = getModelById(selectedModelId)
    if (model) {
      if (!model.features.search && useSearch) {
        setUseSearch(false)
      }
      if (!model.features.thinking && useThinking) {
        setUseThinking(false)
      }
    }
  }, [selectedModelId, useSearch, useThinking])

  const {
    messages: sdkMessages,
    input,
    handleInputChange,
    handleSubmit: handleVercelSubmit,
    isLoading,
    error,
  } = useVercelChat({
    api: currentChatId ? `/api/chat/${currentChatId}` : undefined,
    body: {
      modelId: selectedModelId,
      useSearch,
      useThinking,
      attachments: attachments.map(f => ({ name: f.name, type: f.type })),
      apiKeys: {
        openrouter: localStorage.getItem("openrouter-api-key") || undefined,
        openai: localStorage.getItem("openai-api-key") || undefined,
        anthropic: localStorage.getItem("anthropic-api-key") || undefined,
        xai: localStorage.getItem("xai-api-key") || undefined,
        google: localStorage.getItem("google-api-key") || undefined,
      },
    },
    onResponse: (response) => {
      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      const readChunk = async () => {
        const { done, value } = await reader.read()
        if (done) return
        const chunk = decoder.decode(value)
        try {
          const json = JSON.parse(chunk)
          if (json.content) {
            setStreamingContent(json.content)
          }
          if (json.status) {
            setStreamingStatus(json.status)
            // Update the message status in the database if we have a current chat
            if (currentChatId && sdkMessages && sdkMessages.length > 0) {
              const lastMessage = sdkMessages[sdkMessages.length - 1]
              if (lastMessage.role === "assistant") {
                updateMessage({
                  messageId: lastMessage.id as Id<"messages">,
                  content: lastMessage.content,
                  status: json.status,
                })
              }
            }
          }
        } catch (e) {
          // Ignore invalid JSON chunks
        }
        readChunk()
      }
      readChunk()
    },
    onFinish: async (message) => {
      setStreamingContent("")
      setStreamingStatus('complete')
      if (currentChatId && user && message.content) {
        // Update the assistant message in Convex with the final content
        await updateMessage({
          messageId: sdkMessages[sdkMessages.length - 1].id as Id<"messages">,
          content: message.content,
          status: "sent",
        })
      }
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
        let chatIdToUse = currentChatId

        // If no chat is selected, create a new one with generated title
        if (!chatIdToUse) {
          const title = await generateChatTitle(input)
          chatIdToUse = await createChat({
            userId: user.id,
            title,
            modelId: selectedModelId,
          })
          router.push(`/chat/${chatIdToUse}`)
        }

        try {
          // Upload attachments to Convex storage first
          const uploadedAttachments = await Promise.all(
            attachments.map(async (file) => {
              const formData = new FormData()
              formData.append("file", file)
              const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              })
              if (!response.ok) throw new Error("Failed to upload file")
              const { storageId } = await response.json()
              return {
                name: file.name,
                type: file.type,
                storageId,
              }
            })
          )

          // Add user message with attachment references
          await createMessage({
            chatId: chatIdToUse,
            userId: user.id,
            role: "user",
            content: input,
            attachments: uploadedAttachments,
          })

          handleVercelSubmit(e)
          setAttachments([])
        } catch (error) {
          console.error("Error handling attachments:", error)
          toast.error("Failed to upload attachments")
        }
      } else {
        // For non-authenticated users, just use Vercel AI SDK
        handleVercelSubmit(e)
      }
    },
    [input, isSignedIn, currentChatId, user, attachments, createMessage, createChat, selectedModelId, router, useSearch, useThinking]
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

  // Combine SDK messages with streaming content
  const messages = useMemo(() => {
    if (!sdkMessages) return []
    
    const result = [...sdkMessages]
    if (isLoading && streamingContent && result[result.length - 1]?.role === "assistant") {
      result[result.length - 1] = {
        ...result[result.length - 1],
        content: streamingContent,
      }
    }
    return result
  }, [sdkMessages, isLoading, streamingContent])

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
    setInput: (value: string) => {
      const event = { target: { value } } as React.ChangeEvent<HTMLTextAreaElement>
      handleInputChange(event)
    },
    setAttachments,
    currentChatId,
    streamingContent,
    streamingStatus,
  }
} 