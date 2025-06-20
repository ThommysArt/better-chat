"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Copy, Check, User, Bot, Search, Lightbulb, GitBranch, Edit3, RotateCcw, MoreHorizontal, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { getModelById } from "@/lib/models"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface Message {
  _id: string
  role: string
  content: string
  modelId?: string
  attachments?: { name: string; type: string; storageId: string }[]
  metadata?: {
    searchUsed?: boolean
    thinkingUsed?: boolean
    searchResults?: string[]
    thinkingContent?: string
    tokensUsed?: number
  }
  createdAt: number
}

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
  streamingContent?: string
  streamingStatus?: 'thinking' | 'searching' | 'generating' | 'complete'
  onBranch?: (messageId: string) => void
  onEdit?: (message: Message) => void
  onRerun?: (messageId: string) => void
  canEdit?: boolean
}

export function ChatMessage({ 
  message, 
  isStreaming = false, 
  streamingContent = "",
  streamingStatus,
  onBranch, 
  onEdit, 
  onRerun,
  canEdit = false 
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const model = message.modelId ? getModelById(message.modelId) : null

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const handleBranch = () => {
    if (onBranch) {
      onBranch(message._id)
    }
  }

  const handleEdit = () => {
    if (onEdit && canEdit) {
      onEdit(message)
    }
  }

  const handleRerun = () => {
    if (onRerun) {
      onRerun(message._id)
    }
  }

  // Determine what content to display
  const displayContent = isStreaming && streamingContent ? streamingContent : message.content

  // Status indicator component
  const StatusIndicator = () => {
    if (!isStreaming || !streamingStatus) return null

    const statusConfig = {
      thinking: { icon: Lightbulb, text: "Thinking...", color: "text-yellow-500" },
      searching: { icon: Search, text: "Searching...", color: "text-blue-500" },
      generating: { icon: Loader2, text: "Generating...", color: "text-green-500" },
      complete: { icon: Check, text: "Complete", color: "text-green-500" }
    }

    const config = statusConfig[streamingStatus]
    if (!config) return null

    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground mb-2", config.color)}>
        <config.icon className="h-3 w-3 animate-spin" />
        <span>{config.text}</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex flex-col w-full max-w-[54rem] mx-auto",
        message.role === "user" ? "items-end" : "items-start",
      )}
    >

      <div className={cn(
        "mr-4 bg-primary/30 text-primary-foreground px-4 py-2 rounded-lg max-w-3xl shadow",
        message.role === "user" ? "bg-primary/50" : "bg-muted/20",
        )}
      >        

        {/* Status Indicator */}
        {message.role === "assistant" && <StatusIndicator />}

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
          {(() => {
            // Split content into lines for animation
            const lines = displayContent.split(/\n/);
            const lastLine = lines.pop() ?? "";
            return (
              <>
                {/* Render all but the last line normally */}
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="leading-6 mb-4 last:mb-0">{children}</p>,
                    h1: ({ children }) => <h1 className="text-lg font-bold leading-7 mb-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold leading-6 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold leading-5 mb-2">{children}</h3>,
                    ul: ({ children }) => <ul className="list-disc list-inside leading-6 mb-4 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside leading-6 mb-4 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="leading-6">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic leading-6 mb-4">
                        {children}
                      </blockquote>
                    ),
                    code({ node, className, children, ref, style, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <div className="relative my-4">
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            className="!mt-0 !mb-0"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0"
                            onClick={() => handleCopy(String(children))}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <code className={cn("bg-muted px-1 py-0.5 rounded text-xs font-mono", className)} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => <pre className="leading-6 mb-4">{children}</pre>,
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full border-collapse border border-muted-foreground/20">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-muted-foreground/20 px-3 py-2 text-left font-semibold leading-6">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-muted-foreground/20 px-3 py-2 leading-6">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {lines.join("\n")}
                </ReactMarkdown>
                {/* Animate the last line if streaming */}
                {lastLine && (
                  isStreaming ? (
                    <motion.span
                      key={lastLine}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <span className="leading-6">{children}</span>,
                        }}
                      >
                        {lastLine}
                      </ReactMarkdown>
                    </motion.span>
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <span className="leading-6">{children}</span>,
                      }}
                    >
                      {lastLine}
                    </ReactMarkdown>
                  )
                )}
              </>
            );
          })()}

          {/* Thinking Section */}
          {message.metadata?.thinkingUsed && message.metadata?.thinkingContent && (
            <div className="mt-4 border-t border-muted-foreground/20 pt-4">
              <Collapsible open={showThinking} onOpenChange={setShowThinking}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-2 gap-2 text-xs">
                    <Lightbulb className="h-3 w-3" />
                    <span>Thinking Process</span>
                    {showThinking ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-muted/30 rounded-lg p-3 text-xs">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="leading-5 mb-2 last:mb-0">{children}</p>,
                        code: ({ children }) => (
                          <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {message.metadata.thinkingContent}
                    </ReactMarkdown>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Search Results Section */}
          {message.metadata?.searchUsed && message.metadata?.searchResults && message.metadata.searchResults.length > 0 && (
            <div className="mt-4 border-t border-muted-foreground/20 pt-4">
              <Collapsible open={showSearch} onOpenChange={setShowSearch}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-2 gap-2 text-xs">
                    <Search className="h-3 w-3" />
                    <span>Search Results ({message.metadata.searchResults.length})</span>
                    {showSearch ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="space-y-2">
                    {message.metadata.searchResults.map((result, index) => (
                      <div key={index} className="bg-muted/30 rounded-lg p-3 text-xs">
                        <div className="font-medium mb-1">Result {index + 1}</div>
                        <div className="text-muted-foreground">{result}</div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground text-right mt-3">
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
                <span className="truncate">{fileName.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2">
        {message.role === "assistant" && !isStreaming && (
          <>
            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 gap-2">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBranch}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Branch from here
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRerun}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {message.role === "user" && canEdit && (
          <Button variant="ghost" size="icon" onClick={handleEdit} className="mr-4">
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
