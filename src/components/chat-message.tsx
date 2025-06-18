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
import { toast } from "sonner"

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
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex flex-col w-full max-w-4xl mx-auto",
        message.role === "user" ? "items-end" : "items-start",
      )}
    >

      <div className={cn(
        "mr-4 bg-primary/30 text-primary-foreground px-4 py-2 rounded-lg max-w-3xl shadow",
        message.role === "user" ? "bg-primary/50" : "bg-muted/30",
        )}
      >
        {/* Header */}
        

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
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

          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground text-right">
            <span className="text-[0.6rem] text-right">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
          </div>

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
      </div>

      {/* Actions */}
      {message.role === "assistant" && !isStreaming && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 gap-2">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
