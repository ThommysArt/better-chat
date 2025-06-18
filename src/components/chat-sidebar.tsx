"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Trash2, Edit3, MessageSquare, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { NavUser } from "./nav-user"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { usePaginatedQuery } from "convex/react"

interface Chat {
  _id: Id<"chats">
  title: string
  updatedAt: number
  createdAt: number
}

interface ChatSidebarProps {
  currentChatId?: string
  onNewChat: () => void
  userId: string
}

const editChatSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
})

type EditChatForm = z.infer<typeof editChatSchema>

function groupChatsByTime(chats: Chat[]) {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const sevenDays = 7 * oneDay
  const thirtyDays = 30 * oneDay

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups = {
    today: [] as Chat[],
    yesterday: [] as Chat[],
    last7Days: [] as Chat[],
    last30Days: [] as Chat[],
    older: [] as Chat[],
  }

  chats.forEach((chat) => {
    const chatDate = new Date(chat.updatedAt)
    chatDate.setHours(0, 0, 0, 0)

    if (chatDate.getTime() === today.getTime()) {
      groups.today.push(chat)
    } else if (chatDate.getTime() === yesterday.getTime()) {
      groups.yesterday.push(chat)
    } else if (chat.updatedAt >= now - sevenDays) {
      groups.last7Days.push(chat)
    } else if (chat.updatedAt >= now - thirtyDays) {
      groups.last30Days.push(chat)
    } else {
      groups.older.push(chat)
    }
  })

  return groups
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function ChatSidebar({ currentChatId, onNewChat, userId }: ChatSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingChat, setEditingChat] = useState<Chat | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)

  const updateChatTitle = useMutation(api.chats.updateTitle)
  const deleteChat = useMutation(api.chats.remove)

  const {
    results: chats,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.chats.listPaginated,
    { userId },
    { initialNumItems: 20 }
  )

  const form = useForm<EditChatForm>({
    resolver: zodResolver(editChatSchema),
    defaultValues: {
      title: "",
    },
  })

  const filteredChats = chats?.filter((chat: Chat) => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const groupedChats = groupChatsByTime(filteredChats)

  const startEditing = (chat: Chat) => {
    setEditingChat(chat)
    form.setValue("title", chat.title)
    setIsEditDialogOpen(true)
  }

  const saveEdit = async (data: EditChatForm) => {
    if (editingChat) {
      await updateChatTitle({
        chatId: editingChat._id,
        title: data.title.trim(),
      })
      setIsEditDialogOpen(false)
      setEditingChat(null)
      form.reset()
    }
  }

  const handleDeleteChat = async () => {
    if (chatToDelete) {
      await deleteChat({ chatId: chatToDelete._id })
      setIsDeleteDialogOpen(false)
      setChatToDelete(null)
    }
  }

  const openDeleteDialog = (chat: Chat) => {
    setChatToDelete(chat)
    setIsDeleteDialogOpen(true)
  }

  const renderChatSection = (title: string, chats: Chat[], key: string) => {
    if (chats.length === 0) return null

    return (
      <div key={key} className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 px-4">{title}</h3>
          {chats.map((chat) => (
            <div
              key={chat._id}
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentChatId === chat._id}
                  className="group flex items-center gap-2 p-5 w-full cursor-pointer"
                  onClick={() => router.push(`/chat/${chat._id}`)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />

                    <div className="flex-1 min-w-0">
                      <div>
                        <p className="text-xs font-medium truncate">{chat.title}</p>
                        <p className="text-[0.5rem] text-muted-foreground">
                          {formatDate(new Date(chat.updatedAt))}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEditing(chat)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(chat)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </div>
          ))}
      </div>
    )
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-center mb-2">
            <h1 className="text-xl font-semibold">Better Chat</h1>
          </div>
          <Button onClick={onNewChat} className="w-full gap-2 mb-4" disabled={pathname === "/chat/new"}>
            <Plus className="h-4 w-4" />
            New Chat
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {renderChatSection("Today", groupedChats.today, "today")}
            {renderChatSection("Yesterday", groupedChats.yesterday, "yesterday")}
            {renderChatSection("Last 7 days", groupedChats.last7Days, "last7Days")}
            {renderChatSection("Last 30 days", groupedChats.last30Days, "last30Days")}
            {renderChatSection("Older", groupedChats.older, "older")}
            
            {status === "CanLoadMore" && (
              <div className="p-4">
                <Button 
                  onClick={() => loadMore(20)} 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                >
                  Load More
                </Button>
              </div>
            )}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* Edit Chat Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new title for your chat.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(saveEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter chat title..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{chatToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChat} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
