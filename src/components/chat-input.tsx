"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, ArrowUp, Search, Brain } from "lucide-react"
import { useChat } from "@/hooks/use-chat"
import { ModelSelector } from "@/components/model-selector"
import { AttachmentsPreview } from "@/components/attachments-preview"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useParams } from "next/navigation"
import { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"

const chatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  modelId: z.string(),
  useSearch: z.boolean(),
  useThinking: z.boolean(),
})

type ChatFormValues = z.infer<typeof chatFormSchema>

interface ChatInputProps {
  disabled?: boolean
  placeholder?: string
  autoFocus?: boolean
}

export function ChatInput({
  disabled = false,
  placeholder = "How can I help?",
  autoFocus = false,
}: ChatInputProps) {
  const params = useParams<{ chatId: Id<"chats"> | undefined }>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    isSignedIn = false,
  } = useChat({ chatId: params.chatId })

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: input,
      modelId: selectedModelId || "google/gemini-2.0-flash",
      useSearch: useSearch,
      useThinking: useThinking,
    },
  })

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      form.handleSubmit(onSubmit)()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFileSelect(files)
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  const onSubmit = (data: ChatFormValues) => {
    form.reset()
    setSelectedModelId(data.modelId)
    setUseSearch(data.useSearch)
    setUseThinking(data.useThinking)
    handleSubmit(new Event("submit") as any)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="relative">
        <AttachmentsPreview attachments={attachments} onRemove={removeAttachment} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative bg-muted/60 border border-muted/90 ring-8 ring-muted/30 shadow-lg overflow-hidden backdrop-blur-sm">
              <div className="p-0">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          ref={textareaRef}
                          onChange={(e) => {
                            field.onChange(e)
                            handleInputChange(e)
                            adjustTextareaHeight()
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder={placeholder}
                          disabled={disabled || isLoading}
                          className="min-h-[60px] max-h-[200px] resize-none border-none p-4 pb-2 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                          rows={2}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between gap-2 p-4 pt-2 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9 rounded-lg hover:bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isLoading}
                    type="button"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>

                  <FormField
                    control={form.control}
                    name="useSearch"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Button 
                            variant={field.value ? "default" : "outline"}
                            onClick={() => field.onChange(!field.value)}
                            disabled={disabled || isLoading}
                            size="sm"
                            className={cn(field.value && "bg-primary/20")}
                          >
                            <Search className="h-4 w-4" />
                            <span className="hidden md:block text-sm">Search</span>
                          </Button>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="useThinking"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Button 
                            variant={field.value ? "default" : "outline"}
                            onClick={() => field.onChange(!field.value)}
                            disabled={disabled || isLoading}
                            size="sm"
                            className={cn(field.value && "bg-primary/20")}
                          >
                            <Brain className="h-4 w-4" />
                            <span className="hidden md:block text-sm">Thinking</span>
                          </Button>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="modelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ModelSelector
                            selectedModelId={field.value}
                            onModelSelect={field.onChange}
                            disabled={disabled || isLoading}
                            isSignedIn={isSignedIn}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={disabled || isLoading || !form.watch("message").trim()}
                    size="icon"
                    className="shrink-0 h-9 w-9 rounded-lg"
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.txt,.md,.json,.csv,.pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
