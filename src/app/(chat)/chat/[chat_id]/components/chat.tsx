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
import { useCreateMessage } from "@/core/chat/hooks/use-messages";

export const Chat = ({ conversationId }: { conversationId: string }) => {
  const [selectedModel, setSelectedModel] = useState(availableModels[0].name);
  const { data: conversation, isLoading } = useGetConversation(conversationId);
  const userData = useUser();
  const user = userData.data;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialAiResponseTriggered, setInitialAiResponseTriggered] = useState(false);

  const { mutateAsync: createMessageInDb } = useCreateMessage();

  // Call useChat unconditionally at the top level
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: aiSdkHandleSubmit,
    isLoading: isChatLoading,
    reload,
    setMessages, // Obtain setMessages from useChat
  } = useChat({
    initialMessages: [], // Initialize with an empty array to allow manual synchronization
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

  // Effect to synchronize messages from conversation to useChat's state
  // This ensures that when conversation data updates (e.g., after a message is saved),
  // the `useChat` hook's internal message state is also updated,
  // making the UI reflect the latest messages from the database.
  // Only update if not currently loading/streaming to prevent disrupting active streams.
  useEffect(() => {
    if (conversation?.messages && !isChatLoading) {
      const newMessages = conversation.messages.map((msg) => ({
        id: msg.id,
        role: (msg.role === "user" ? "user" : "assistant") as Message['role'], // Explicitly cast role
        content: msg.content,
        createdAt: new Date(msg.createdAt),
      }));

      // Compare lengths and the last message's ID to detect if a real update is needed.
      // This avoids unnecessary re-renders and potential conflicts during streaming.
      if (messages.length !== newMessages.length ||
          (newMessages.length > 0 && messages.length > 0 && newMessages[newMessages.length - 1].id !== messages[messages.length - 1].id)
      ) {
        setMessages(newMessages);
      }
    }
  }, [conversation?.messages, setMessages, isChatLoading, messages]);

  // Log and send message to AI if the chat has only one message on initial load
  useEffect(() => {
    if (conversation && conversation.messages.length === 1 && conversation.messages[0].role === 'user' && !initialAiResponseTriggered && !isChatLoading) {
      console.log("Chat loaded with a single user message. Triggering AI response.");
      // Ensure useChat's messages are synchronized with the database's initial user message
      // before calling reload, to provide correct context to the AI.
      if (messages.length === 0 || messages[0]?.id !== conversation.messages[0].id) {
        setMessages(conversation.messages.map((msg) => ({
            id: msg.id,
            role: (msg.role === "user" ? "user" : "assistant") as Message['role'],
            content: msg.content,
            createdAt: new Date(msg.createdAt),
        })));
      }
      reload();
      setInitialAiResponseTriggered(true);
      console.log("fin")
    }
  }, [conversation, reload, initialAiResponseTriggered, isChatLoading, messages, setMessages]);

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

    if (!input.trim() || isSubmitting || isChatLoading) return; // Prevent submission if already submitting or chat is loading

    setIsSubmitting(true); // Set submitting true to disable button immediately

    // Temporarily add user message to useChat's state for immediate display
    setMessages([...messages, {
      id: `temp-${Date.now()}`, // Use a temporary unique ID
      role: 'user',
      content: input,
      createdAt: new Date(),
    } as Message]);

    if (user?.id && conversation?.selectedModel) {
      await createMessageInDb({ // Await for persistence in the database
        conversationId: conversationId,
        role: 'user',
        content: input,
        model: conversation.selectedModel,
      });
    }

    aiSdkHandleSubmit(e); // Trigger AI SDK's submit handler
    setIsSubmitting(false); // Set submitting false after aiSdkHandleSubmit initiates
  };

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
                <AssistantMessage key={`${message.id}`} content={message.content} />
              ) : (
                <UserMessage key={`${message.id}`} content={message.content} userEmail={userEmail} />
              )}
            </div>
          ))}
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
                <Button size="icon" className="size-9 rounded-full" type="submit" disabled={isChatLoading || !input.trim() || isSubmitting}>
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
