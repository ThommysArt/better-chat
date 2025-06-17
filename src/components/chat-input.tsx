"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Paperclip, ArrowUp, ChevronDown } from "lucide-react"
import { getAllModels, getModelById } from "@/lib/models"
import { motion, AnimatePresence } from "framer-motion"
import CustomSwitch from "@/components/custom-switch"
import { useUser } from "@clerk/nextjs"

interface ChatInputProps {
  onSendMessage: (
    message: string,
    options: {
      modelId: string
      useSearch: boolean
      useThinking: boolean
      attachments?: File[]
    },
  ) => void
  disabled?: boolean
  placeholder?: string
  autoFocus?: boolean
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "How can I help?",
  autoFocus = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [selectedModelId, setSelectedModelId] = useState("google/gemini-2.0-flash-exp")
  const [useSearch, setUseSearch] = useState(false)
  const [useThinking, setUseThinking] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isSignedIn } = useUser()

  const selectedModel = getModelById(selectedModelId)
  const models = getAllModels()

  // Filter models based on authentication status
  const availableModels = isSignedIn ? models : models.filter((model) => model.id === "google/gemini-2.0-flash-exp")

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = useCallback(() => {
    if (!message.trim() || disabled) return

    onSendMessage(message, {
      modelId: selectedModelId,
      useSearch,
      useThinking,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    setMessage("")
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [message, selectedModelId, useSearch, useThinking, attachments, onSendMessage, disabled])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="relative">
        {/* Attachments Preview */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2 flex flex-wrap gap-2"
            >
              {attachments.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm"
                >
                  <span className="truncate max-w-32">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeAttachment(index)}
                  >
                    ×
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Container */}
        <div className="relative bg-background border border-border rounded-2xl shadow-lg overflow-hidden">
          {/* Text Input - Top Section */}
          <div className="p-4 pb-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              rows={2}
            />
          </div>

          {/* Controls - Bottom Section */}
          <div className="flex items-center justify-between gap-2 p-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              {/* Attachment Button */}
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9 rounded-lg hover:bg-muted"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </Button>

              {/* Search Toggle */}
              <div className="flex items-center gap-2">
                <CustomSwitch
                  labelOn="ON"
                  labelOff="OFF"
                  value={useSearch}
                  onValueChange={setUseSearch}
                  className="scale-75"
                />
                <span className="text-sm font-medium">DeepSearch</span>
              </div>

              {/* Thinking Toggle */}
              <div className="flex items-center gap-2">
                <CustomSwitch
                  labelOn="ON"
                  labelOff="OFF"
                  value={useThinking}
                  onValueChange={setUseThinking}
                  className="scale-75"
                />
                <span className="text-sm font-medium">Think</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="shrink-0 rounded-lg gap-2 font-medium" disabled={disabled}>
                    {selectedModel?.name || "Select Model"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {Object.entries(
                    availableModels.reduce(
                      (acc, model) => {
                        if (!acc[model.company]) acc[model.company] = []
                        acc[model.company].push(model)
                        return acc
                      },
                      {} as Record<string, typeof availableModels>,
                    ),
                  ).map(([company, companyModels]) => (
                    <div key={company}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">{company}</div>
                      {companyModels.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => setSelectedModelId(model.id)}
                          className="flex flex-col items-start gap-1 p-3"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{model.name}</span>
                            {selectedModelId === model.id && <div className="h-2 w-2 bg-primary rounded-full" />}
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-2">{model.description}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </div>
                  ))}
                  {!isSignedIn && (
                    <div className="p-2 text-xs text-muted-foreground border-t">Sign in to access more models</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Send Button */}
              <Button
                onClick={handleSubmit}
                disabled={disabled || !message.trim()}
                size="icon"
                className="shrink-0 h-9 w-9 rounded-lg"
              >
                <ArrowUp className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.txt,.md,.json,.csv,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
