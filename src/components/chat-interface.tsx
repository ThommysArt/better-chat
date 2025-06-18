"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ChatInput } from "./chat-input"
import { ChatMessage } from "./chat-message"
import { ChatSidebar } from "./chat-sidebar"
import { Button } from "@/components/ui/button"
import { Settings, Plus } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeSwitcher } from "@/components/theme-switcher"

interface ChatInterfaceProps {
  chatId?: Id<"chats">
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messages = useQuery(api.messages.list, chatId ? { chatId: chatId as Id<"chats"> } : "skip")

  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<Id<"messages"> | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
                {messages.map((message) => (
                  <ChatMessage key={message._id} message={message} isStreaming={streamingMessageId === message._id} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
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
