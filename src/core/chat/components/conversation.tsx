"use client"

import { AssistantMessage } from "@/core/chat/components/assistant-message"
import { UserMessage } from "@/core/chat/components/user-message"
import { ChatContainerContent, ChatContainerRoot, ChatContainerScrollAnchor } from "@/components/chat-container"
import { type Message } from '@ai-sdk/react'

interface ConversationProps {
  messages: Message[];
  userEmail: string;
}

export function Conversation({ messages, userEmail }: ConversationProps) {
  return (
    <ChatContainerRoot className="flex-1 px-3 pb-[140px] md:px-5 md:pb-[140px] max-w-3xl mx-auto">
      <ChatContainerContent className="flex-1 flex flex-col w-full max-w-3xl mx-auto py-8">
        {messages.map(message => (
          <div key={message.id} className="whitespace-pre-wrap mb-4 max-w-3xl">
            {message.role === 'assistant' ? (
              message.parts && message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <AssistantMessage key={`${message.id}-${i}`} content={part.text} />;
                }
              })
            ) : (
              message.parts && message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <UserMessage key={`${message.id}-${i}`} content={part.text} userEmail={userEmail} />;
                }
              })
            )}
          </div>
        ))}
        <ChatContainerScrollAnchor />
      </ChatContainerContent>
    </ChatContainerRoot>
  )
}
