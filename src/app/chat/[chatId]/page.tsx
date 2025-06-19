import { ChatInterface } from "@/components/chat-interface"
import { Id } from "@/convex/_generated/dataModel"


export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const chatId = (await params).chatId as Id<"chats">
  return <ChatInterface chatId={chatId} />
}
