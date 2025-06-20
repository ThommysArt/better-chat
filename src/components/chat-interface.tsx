"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"
import { getModelById } from "@/lib/models"

interface ChatInterfaceProps {
  chatId?: Id<"chats">
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messages = useQuery(api.messages.list, chatId ? { chatId: chatId as Id<"chats"> } : "skip")

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
    setInput,
    setAttachments,
    currentChatId,
    messages: sdkMessages,
    streamingContent,
    streamingStatus,
  } = useChat({ chatId })

  const selectedModel = selectedModelId ? getModelById(selectedModelId) : null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, sdkMessages])

  // Mutations
  const createChat = useMutation(api.chats.create)
  const createChatFromExisting = useMutation(api.chats.createFromExisting)
  const deleteAfter = useMutation(api.messages.deleteAfter)
  const deleteMessage = useMutation(api.messages.deleteMessage)
  const updateMessage = useMutation(api.messages.update)
  const createMessage = useMutation(api.messages.create)

  // Handle branching from a message
  const handleBranch = async (messageId: string) => {
    if (!isSignedIn || !currentChatId) return

    try {
      const newChatId = await createChatFromExisting({
        userId: user!.id,
        title: `Branch from ${new Date().toLocaleString()}`,
        modelId: selectedModelId || "google/gemini-2.0-flash",
        sourceChatId: currentChatId,
        upToMessageId: messageId as Id<"messages">,
      })

      router.push(`/chat/${newChatId}`)
      toast.success("Chat branched successfully")
    } catch (error) {
      console.error("Error branching chat:", error)
      toast.error("Failed to branch chat")
    }
  }

  // Handle editing a user message
  const handleEdit = async (message: any) => {
    if (!isSignedIn || !currentChatId) return

    try {
      // Delete all messages after this one
      await deleteAfter({
        chatId: currentChatId,
        messageId: message._id as Id<"messages">,
      })

      // Set the form values for editing
      setInput(message.content)
      setSelectedModelId(message.modelId || "google/gemini-2.0-flash")
      
      // Set attachments if any
      if (message.attachments && message.attachments.length > 0) {
        // Convert attachment objects back to File objects (simplified)
        const attachmentFiles = message.attachments.map((attachment: { name: string; type: string; storageId: string }) => 
          new File([""], attachment.name, { type: attachment.type || "text/plain" })
        )
        setAttachments(attachmentFiles)
      }

      // Set metadata if available
      if (message.metadata) {
        setUseSearch(message.metadata.searchUsed || false)
        setUseThinking(message.metadata.thinkingUsed || false)
      }

      toast.success("Message loaded for editing")
    } catch (error) {
      console.error("Error editing message:", error)
      toast.error("Failed to edit message")
    }
  }

  // Handle re-running a message
  const handleRerun = async (messageId: string) => {
    if (!isSignedIn || !currentChatId) return

    try {
      // Find the message to re-run
      const messageToRerun = messages?.find(m => m._id === messageId)
      if (!messageToRerun) return

      // Delete all messages after this one
      await deleteAfter({
        chatId: currentChatId,
        messageId: messageId as Id<"messages">,
      })

      // Set the form values to the original user message
      setInput(messageToRerun.content)
      setSelectedModelId(messageToRerun.modelId || "google/gemini-2.0-flash")
      
      if (messageToRerun.metadata) {
        setUseSearch(messageToRerun.metadata.searchUsed || false)
        setUseThinking(messageToRerun.metadata.thinkingUsed || false)
      }

      // Create a new assistant message with initial status
      await createMessage({
        chatId: currentChatId,
        userId: user!.id,
        role: "assistant",
        content: "",
        modelId: messageToRerun.modelId || "google/gemini-2.0-flash",
        status: "generating",
        metadata: {
          searchUsed: messageToRerun.metadata?.searchUsed || false,
          thinkingUsed: messageToRerun.metadata?.thinkingUsed || false,
        },
      })

      // Trigger the chat submission
      const formEvent = new Event("submit") as any
      handleSubmit(formEvent)

      toast.success("Regenerating response...")
    } catch (error) {
      console.error("Error re-running message:", error)
      toast.error("Failed to regenerate response")
    }
  }

  // Check if a message can be edited (no newer messages)
  const canEditMessage = (messageIndex: number) => {
    if (!messages) return false
    return messageIndex === messages.length - 1
  }

  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full bg-background">
        {/* Sidebar */}
        <ChatSidebar 
          currentChatId={chatId} 
          onNewChat={() => router.push("/chat/new")} 
          userId={user?.id || ""}
        />

        <SidebarTrigger className="absolute top-4 left-4 z-20" />

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
          <div className="flex-1 overflow-y-auto pt-16 pb-40">
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
                {/* Render all Convex messages except the last assistant if streaming */}
                {(() => {
                  // Find if the SDK is streaming an assistant message
                  const sdkAssistant = sdkMessages && sdkMessages.length > 0 && sdkMessages[sdkMessages.length - 1].role === "assistant"
                    ? sdkMessages[sdkMessages.length - 1]
                    : null
                  // If streaming, exclude the last assistant message from Convex messages
                  const convexMessages = isLoading && sdkAssistant
                    ? messages.slice(0, -1)
                    : messages
                  return (
                    <>
                      {convexMessages.map((message, index) => (
                        <ChatMessage 
                          key={message._id} 
                          message={message} 
                          isStreaming={message.status && message.status !== 'sent'}
                          onBranch={handleBranch}
                          onEdit={handleEdit}
                          onRerun={handleRerun}
                          canEdit={message.role === "user" && canEditMessage(index)}
                        />
                      ))}
                      {/* Show streaming assistant message from SDK */}
                      {isLoading && sdkAssistant && (
                        <ChatMessage 
                          message={{
                            _id: "streaming-assistant",
                            role: "assistant",
                            content: sdkAssistant.content,
                            createdAt: Date.now(),
                            modelId: selectedModelId,
                            status: "generating",
                            attachments: [],
                            metadata: {
                              searchUsed: useSearch,
                              thinkingUsed: useThinking,
                              searchResults: [],
                              thinkingContent: "",
                            },
                          }}
                          isStreaming={true}
                          streamingContent={streamingContent}
                        />
                      )}
                    </>
                  )
                })()}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <ChatInput
              disabled={isLoading}
              placeholder={!messages || messages.length === 0 ? "How can I help?" : "Continue the conversation..."}
              autoFocus={!chatId}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
