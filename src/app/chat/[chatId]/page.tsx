import { ChatInterface } from "@/components/chat-interface"
import { Id } from "@/convex/_generated/dataModel"


export default async function ChatPage({ params }: { params: Promise<{ chatId: Id<"chats"> }> }) {
  const chatId = (await params).chatId
  return <ChatInterface chatId={chatId} />
}
