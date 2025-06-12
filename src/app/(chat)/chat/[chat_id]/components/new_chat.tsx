"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, MoreHorizontal, Mic, Plus, Globe } from "lucide-react";
import React, { useState, useEffect } from "react";
import { ModelsSelector } from "@/core/chat/components/models-selector";
import { availableModels } from "@/core/ai/types";

import { AssistantMessage } from "@/core/chat/components/assistant-message";
import { UserMessage } from "@/core/chat/components/user-message";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/chat-container";
import { useChat, type Message } from "@ai-sdk/react";
import { useGetConversation } from "@/core/chat/hooks/use-conversations";
import useUser from "@/core/auth/hook/use-user";
import {
  useCreateMessage,
  useUpdateMessageAndTruncate,
} from "@/core/chat/hooks/use-messages";

export const Chat = ({ conversationId }: { conversationId: string }) => {
  const [selectedModel, setSelectedModel] = useState(availableModels[0].name);
  const userData = useUser();
  const userEmail = userData.data?.email || "anonymous";
  const { data: conversation, isLoading } = useGetConversation(conversationId);
  const [initialMessageSent, setInitialMessageSent] = useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: aiSdkHandleSubmit,
    status,
    reload,
    setMessages, // Obtain setMessages from useChat
  } = useChat({
    initialMessages: conversation?.messages.map((message) => ({
      id: message.id,
      role: (message.role === "user" ? "user" : "assistant") as Message['role'],
      content: message.content,
      createdAt: new Date(message.createdAt),
    })), // Initialize with an empty array to allow manual synchronization
  });

  useEffect(() => {
    if (conversation && conversation.messages.length === 1 && !initialMessageSent) {
      
      console.log("hey")
      reload()
      setInitialMessageSent(true)
    }
  }, [conversation, reload, initialMessageSent])

  return (
    <div className="relative flex flex-col h-[calc(100vh_-_var(--header-height))]">
      <ChatContainerRoot className="flex-1 px-3 pb-[140px] md:px-5 md:pb-[140px] mx-auto overflow-y-auto">
        <ChatContainerContent className="flex-1 flex flex-col w-full mx-auto py-8 gap-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className="whitespace-pre-wrap mb-4 max-w-3xl"
            >
              {message.role === "assistant" ? (
                <AssistantMessage
                  key={`${message.id}`}
                  content={message.content}
                />
              ) : (
                <UserMessage
                  key={`${message.id}`}
                  content={message.content}
                  userEmail={userEmail}
                />
              )}
            </div>
          ))}
        </ChatContainerContent>
      </ChatContainerRoot>
      <div className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-3xl px-3 pb-3 md:px-5 md:pb-5 bg-background">
        <PromptInput className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs">
          <form onSubmit={aiSdkHandleSubmit} className="flex flex-col">
            <PromptInputTextarea
              placeholder="Ask anything"
              className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  aiSdkHandleSubmit(e as any);
                }
              }}
            />

            <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
              <div className="flex items-center gap-2">
                <ModelsSelector
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  className="size-9 rounded-full"
                  type="submit"
                  disabled={status === "streaming" || !input.trim()}
                >
                  <ArrowUp size={18} />
                </Button>
              </div>
            </PromptInputActions>
          </form>
        </PromptInput>
      </div>
    </div>
  );
};
