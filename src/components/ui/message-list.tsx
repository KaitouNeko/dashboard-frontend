import {
  ChatMessage,
  type ChatMessageProps,
  type Message,
} from "@/components/ui/chat-message"
import { TypingIndicator } from "@/components/ui/typing-indicator"

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>

interface MessageListProps {
  messages: Message[]
  showTimeStamps?: boolean
  isTyping?: boolean
  messageOptions?:
    | AdditionalMessageOptions
    | ((message: Message) => AdditionalMessageOptions)
  typingIndicator?: React.ReactNode
  userAvatarSrc?: string
  assistantAvatarSrc?: string
}

export function MessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
  typingIndicator,
  userAvatarSrc,
  assistantAvatarSrc,
}: MessageListProps) {
  return (
    <div className="space-y-4 overflow-visible">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === "function"
            ? messageOptions(message)
            : messageOptions

        // Determine which avatar to use based on the message role
        const avatarSrc = message.role === "user" ? userAvatarSrc : assistantAvatarSrc

        return (
          <ChatMessage
            key={index}
            showTimeStamp={showTimeStamps}
            avatarSrc={avatarSrc}
            {...message}
            {...additionalOptions}
          />
        )
      })}
      {isTyping && (typingIndicator || <TypingIndicator />)}
    </div>
  )
}
