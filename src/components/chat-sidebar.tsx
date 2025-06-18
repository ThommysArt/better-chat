"use client"

import { useState } from "react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Trash2, Edit3, MessageSquare, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { NavUser } from "./nav-user"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

interface Chat {
  _id: Id<"chats">
  title: string
  updatedAt: number
  createdAt: number
}

interface ChatSidebarProps {
  chats: Chat[]
  currentChatId?: string
  onNewChat: () => void
}

export function ChatSidebar({ chats, currentChatId, onNewChat }: ChatSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")


  const updateChatTitle = useMutation(api.chats.updateTitle)
  const deleteChat = useMutation(api.chats.remove)

  const filteredChats = chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const startEditing = (chat: Chat) => {
    setEditingChatId(chat._id)
    setEditTitle(chat.title)
  }

  const saveEdit = async () => {
    if (editingChatId && editTitle.trim()) {
      await updateChatTitle({
        chatId: editingChatId as Id<"chats">,
        title: editTitle.trim(),
      })
    }
    setEditingChatId(null)
    setEditTitle("")
  }

  const cancelEdit = () => {
    setEditingChatId(null)
    setEditTitle("")
  }

  const handleDeleteChat = async (chatId: Id<"chats">) => {
    await deleteChat({ chatId })
  }

  return (
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
          <AnimatePresence>
            {filteredChats.map((chat) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
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
                        {editingChatId === chat._id ? (
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit()
                              if (e.key === "Escape") cancelEdit()
                            }}
                            className="h-6 text-sm"
                            autoFocus
                          />
                        ) : (
                          <div>
                            <p className="text-xs font-medium truncate">{chat.title}</p>
                            <p className="text-[0.5rem] text-muted-foreground">
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
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
                            onClick={() => handleDeleteChat(chat._id)}
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
              </motion.div>
            ))}
          </AnimatePresence>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
