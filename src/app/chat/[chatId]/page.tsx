import { ChatInterface } from "@/components/chat-interface"

interface ChatPageProps {
  params: {
    chatId: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  return <ChatInterface chatId={params.chatId} />
}
