"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, MoreHorizontal, Mic, Plus, Globe } from "lucide-react";
import React, { useState } from "react";
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
import { useCreateMessage } from "@/core/chat/hooks/use-messages";

export const Chat = ({ conversationId }: { conversationId: string }) => {
  const [selectedModel, setSelectedModel] = useState(availableModels[0].name);
  const { data: conversation, isLoading } = useGetConversation(conversationId);
  const userData = useUser();
  const user = userData.data;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createMessageInDb } = useCreateMessage();

  // Ensure initialMessages are always defined, even when conversation is not yet loaded
  const initialMessages: Message[] =
    conversation?.messages.map((msg) => ({
      id: msg.id,
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
      createdAt: new Date(msg.createdAt),
    })) || [];

  // Call useChat unconditionally at the top level
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: aiSdkHandleSubmit,
    isLoading: isChatLoading,
  } = useChat({
    initialMessages: initialMessages,
    onFinish: async (message) => {
      if (conversation?.selectedModel) {
        await createMessageInDb({
          conversationId: conversationId,
          role: 'assistant',
          content: message.content,
          model: conversation.selectedModel,
        });
      }
    },
  });

  const userEmail = user?.email || "anonymous";

  if (isLoading) {
    return <div>Loading conversation...</div>;
  }

  if (!conversation) {
    return <div>Conversation not found.</div>;
  }

  // Custom handleSubmit to save user message before sending to AI
  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);

    if (user?.id && conversation?.selectedModel) {
      await createMessageInDb({
        conversationId: conversationId,
        role: 'user',
        content: input,
        model: conversation.selectedModel,
      });
    }

    aiSdkHandleSubmit(e);
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh_-_var(--header-height))]">
      <ChatContainerRoot className="flex-1 px-3 pb-[140px] md:px-5 md:pb-[140px] max-w-3xl mx-auto overflow-y-auto">
        <ChatContainerContent className="flex-1 flex flex-col w-full max-w-3xl mx-auto py-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className="whitespace-pre-wrap mb-4 max-w-3xl"
            >
              {message.role === "assistant" ? (
                <AssistantMessage key={`${message.id}`} content={message.content} />
              ) : (
                <UserMessage key={`${message.id}`} content={message.content} userEmail={userEmail} />
              )}
            </div>
          ))}
          <ChatContainerScrollAnchor />
        </ChatContainerContent>
      </ChatContainerRoot>
      <div className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-3xl px-3 pb-3 md:px-5 md:pb-5 bg-background">
        <PromptInput className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs">
          <form onSubmit={handleCustomSubmit} className="flex flex-col">
            <PromptInputTextarea
              placeholder="Ask anything"
              className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCustomSubmit(e as any);
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
                <Button size="icon" className="size-9 rounded-full" type="submit" disabled={isChatLoading || !input.trim()}>
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
