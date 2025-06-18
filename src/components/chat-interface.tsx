"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ChatInput } from "./chat-input"
import { ChatMessage } from "./chat-message"
import { ChatSidebar } from "./chat-sidebar"
import { Button } from "@/components/ui/button"
import { Settings, Plus } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useChat } from "@/hooks/use-chat"

interface ChatInterfaceProps {
  chatId?: Id<"chats">
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const createChat = useMutation(api.chats.create)
  const createMessage = useMutation(api.messages.create)
  const updateMessage = useMutation(api.messages.update)

  const chats = useQuery(api.chats.list, isSignedIn ? { userId: user!.id } : "skip")
  const currentChat = useQuery(api.chats.get, chatId ? { chatId: chatId as Id<"chats"> } : "skip")
  const messages = useQuery(api.messages.list, chatId ? { chatId: chatId as Id<"chats"> } : "skip")

  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<Id<"messages"> | null>(null)

  const {
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
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
  } = useChat({ chatId })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const createNewChat = async () => {
    if (!isSignedIn) {
      router.push("/chat/new")
      return
    }

    const newChatId = await createChat({
      userId: user!.id,
      title: "New Chat",
      modelId: "google/gemini-2.0-flash-exp",
    })

    router.push(`/chat/${newChatId}`)
  }

  const handleSendMessage = async (
    content: string,
    options: {
      modelId: string
      useSearch: boolean
      useThinking: boolean
      attachments?: File[]
    },
  ) => {
    if (!isSignedIn) {
      // For non-authenticated users, handle locally
      handleGuestChat(content, options)
      return
    }

    let currentChatId = chatId as Id<"chats">

    // Create new chat if we don't have one
    if (!currentChatId) {
      currentChatId = await createChat({
        userId: user!.id,
        title: content.slice(0, 50),
        modelId: options.modelId,
      })
      router.push(`/chat/${currentChatId}`)
    }

    // Add user message
    await createMessage({
      chatId: currentChatId,
      userId: user!.id,
      role: "user",
      content,
      attachments: options.attachments?.map((f) => f.name),
    })

    // Start streaming assistant response
    setIsStreaming(true)
    const assistantMessageId = await createMessage({
      chatId: currentChatId,
      userId: user!.id,
      role: "assistant",
      content: "",
      modelId: options.modelId,
      metadata: {
        searchUsed: options.useSearch,
        thinkingUsed: options.useThinking,
      },
    })

    setStreamingMessageId(assistantMessageId)

    try {
      // Get user's API key from localStorage
      const userApiKey = localStorage.getItem("openrouter-api-key")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages?.map((m) => ({ role: m.role, content: m.content })) || [],
          modelId: options.modelId,
          useSearch: options.useSearch,
          useThinking: options.useThinking,
          apiKey: userApiKey,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const data = JSON.parse(line.slice(2))
              if (data.type === "text-delta") {
                accumulatedContent += data.textDelta
                await updateMessage({
                  messageId: assistantMessageId,
                  content: accumulatedContent,
                })
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error)
      await updateMessage({
        messageId: assistantMessageId,
        content: "Sorry, I encountered an error. Please try again.",
      })
    } finally {
      setIsStreaming(false)
      setStreamingMessageId(null)
    }
  }

  const handleGuestChat = async (
    content: string,
    options: {
      modelId: string
      useSearch: boolean
      useThinking: boolean
    },
  ) => {
    // Handle guest chat with local state (simplified for demo)
    console.log("Guest chat:", content, options)
  }

  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full bg-background">
        {/* Sidebar */}
        {isSignedIn && <ChatSidebar chats={chats || []} currentChatId={chatId} onNewChat={createNewChat} />}

        {isSignedIn && <SidebarTrigger className="absolute top-4 left-4 z-20" />}

        {/* Main Chat Area */}
        <div className="relative flex-1 flex flex-col">
          {/* Header */}
          
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-3 p-4"> 
            </div>
            <div className="flex items-center border backdrop-blur-sm">
              <ThemeSwitcher />
              <Button variant="ghost" size="icon" onClick={() => router.push("/settings?tab=system")}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto pt-16">
            {!messages || messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-semibold">Start a conversation</h2>
                  <p className="text-muted-foreground">
                    {isSignedIn
                      ? "Ask me anything, and I'll help you with detailed responses."
                      : "Try Gemini 2.0 Flash for free, or sign in for access to more models."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 p-4">
                {messages.map((message) => (
                  <ChatMessage key={message._id} message={message} isStreaming={streamingMessageId === message._id} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <ChatInput
              disabled={isStreaming}
              placeholder={!messages || messages.length === 0 ? "How can I help?" : "Continue the conversation..."}
              autoFocus={!chatId}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
