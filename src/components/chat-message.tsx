"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Copy, Check, User, Bot, Search, Lightbulb } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { getModelById } from "@/lib/models"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

interface Message {
  _id: string
  role: "user" | "assistant"
  content: string
  modelId?: string
  attachments?: string[]
  metadata?: {
    searchUsed?: boolean
    thinkingUsed?: boolean
    tokensUsed?: number
  }
  createdAt: number
}

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const model = message.modelId ? getModelById(message.modelId) : null

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex gap-4 p-4 rounded-lg transition-colors",
        message.role === "user" ? "bg-muted/50 ml-12" : "hover:bg-muted/30",
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
          {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{message.role === "user" ? "You" : model?.name || "Assistant"}</span>
          {message.metadata?.searchUsed && (
            <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
              <Search className="h-3 w-3" />
              Search
            </div>
          )}
          {message.metadata?.thinkingUsed && (
            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs">
              <Lightbulb className="h-3 w-3" />
              Thinking
            </div>
          )}
          <span className="text-xs">{new Date(message.createdAt).toLocaleTimeString()}</span>
        </div>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.role === "user" ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code({ node, className, children, ref, style, ...props }) {
                  const match = /language-(\w+)/.exec(className || "")
                  return match ? (
                    <div className="relative">
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md !mt-2 !mb-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={() => navigator.clipboard.writeText(String(children))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {isStreaming && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              className="inline-block w-2 h-4 bg-primary ml-1"
            />
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.attachments.map((fileName, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm">
                <span className="truncate">{fileName}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {message.role === "assistant" && !isStreaming && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 gap-2">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
