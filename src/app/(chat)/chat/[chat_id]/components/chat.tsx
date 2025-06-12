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
import { useCreateMessage, useUpdateMessageAndTruncate } from "@/core/chat/hooks/use-messages";
import { ToolInvocation } from "ai";

// No need for CustomMessage here if we just ensure content is always a string.
// interface CustomMessage extends Message {
//   parts: Message['parts']; // Use the 'parts' type from AI SDK's Message for consistency
//   content: string | null; // Allow content to be null
// }

export const Chat = ({ conversationId }: { conversationId: string }) => {
  const [selectedModel, setSelectedModel] = useState(availableModels[0].name);
  const { data: conversation, isLoading } = useGetConversation(conversationId);
  const userData = useUser();
  const user = userData.data;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialAiResponseTriggered, setInitialAiResponseTriggered] = useState(false);
  const [shouldReloadAfterEdit, setShouldReloadAfterEdit] = useState(false);

  const { mutateAsync: createMessageInDb } = useCreateMessage();
  const { mutateAsync: updateMessageAndTruncate } = useUpdateMessageAndTruncate();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: aiSdkHandleSubmit,
    isLoading: isChatLoading,
    reload,
    setMessages, // Obtain setMessages from useChat
  } = useChat({
    initialMessages: [],
    onFinish: async (message) => {
      console.log("onFinish triggered. Full Message object (from useChat):", message);
      if (conversation?.selectedModel) {
        const fullTextContent = message.parts
          .filter(part => part.type === 'text')
          .map(part => part.text)
          .join('');

        const savedMessage = await createMessageInDb({
          conversationId: conversationId,
          role: 'assistant',
          content: fullTextContent,
          model: conversation.selectedModel,
          rawParts: message.parts,
        });
        console.log("Assistant message saved to DB with rawParts and aggregated content:", fullTextContent);

        setMessages(prevMessages => {
          const updatedPrevMessages = prevMessages.map(msg =>
            msg.id === message.id
              ? {
                  ...msg,
                  content: savedMessage.content || '',
                  parts: savedMessage.rawParts || [{ type: 'text', text: savedMessage.content || '' }],
                  id: savedMessage.id
                }
              : msg
          );

          if (!updatedPrevMessages.find(msg => msg.id === savedMessage.id)) {
            updatedPrevMessages.push({
              id: savedMessage.id,
              role: savedMessage.role as Message['role'],
              content: savedMessage.content || '',
              createdAt: new Date(savedMessage.createdAt),
              parts: savedMessage.rawParts || [{ type: 'text', text: savedMessage.content || '' }],
            });
          }
          return updatedPrevMessages;
        });
      }
    },
    maxSteps: 5,
    onToolCall: async ({ toolCall }) => {
      console.log("onToolCall triggered. Tool Call:", toolCall);
    }
  });

  useEffect(() => {
    if (conversation?.messages) {
      const newMessages = conversation.messages.map((msg) => ({
        id: msg.id,
        role: (msg.role === "user" ? "user" : "assistant") as Message['role'],
        content: msg.content || '',
        createdAt: new Date(msg.createdAt),
        parts: (msg as any).rawParts || [{ type: 'text', text: msg.content || '' }],
      }));
      console.log("Synchronizing messages to useChat state:", newMessages);
      setMessages(newMessages);
    }
  }, [conversation?.messages, setMessages]);

  useEffect(() => {
    if (conversation && conversation.messages.length === 1 && conversation.messages[0].role === 'user' && !initialAiResponseTriggered && !isChatLoading) {
      console.log("Chat loaded with a single user message. Triggering AI response.");
      if (messages.length === 0 || messages[0]?.id !== conversation.messages[0].id) {
        setMessages(conversation.messages.map((msg) => ({
            id: msg.id,
            role: (msg.role === "user" ? "user" : "assistant") as Message['role'],
            content: msg.content || '',
            createdAt: new Date(msg.createdAt),
            parts: (msg as any).rawParts || [{ type: 'text', text: msg.content || '' }],
        })));
      }
      reload();
      setInitialAiResponseTriggered(true);
      console.log("Initial AI response triggered for single user message.");
    }
  }, [conversation, reload, initialAiResponseTriggered, isChatLoading, messages, setMessages]);

  const handleMessageEdit = async (messageId: string, newContent: string) => {
    try {
      await updateMessageAndTruncate({ messageId, newContent });
      setShouldReloadAfterEdit(true);
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  useEffect(() => {
    if (shouldReloadAfterEdit && !isChatLoading) {
      reload();
      setShouldReloadAfterEdit(false);
    }
  }, [shouldReloadAfterEdit, isChatLoading, reload]);

  const userEmail = user?.email || "anonymous";

  if (isLoading) {
    return <div>Loading conversation...</div>;
  }

  if (!conversation) {
    return <div>Conversation not found.</div>;
  }

  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isSubmitting || isChatLoading) return;

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
    setIsSubmitting(false);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh_-_var(--header-height))]">
      <ChatContainerRoot className="flex-1 px-3 pb-[140px] md:px-5 md:pb-[140px] mx-auto overflow-y-auto">
        <ChatContainerContent className="flex-1 flex flex-col w-full mx-auto py-8 gap-6">
          {messages.map((message) => {
            if (!message) {
              console.warn("Skipping rendering of an undefined message.", message);
              return null;
            }

            return (
              <div
                key={message.id}
                className="whitespace-pre-wrap mb-4 max-w-3xl"
              >
                {message.role === "assistant" ? (
                  <AssistantMessage key={`${message.id}`} message={message} />
                ) : (
                  <UserMessage
                    key={`${message.id}`}
                    content={message.content}
                    userEmail={userEmail}
                    onMessageEdit={(newContent) => handleMessageEdit(message.id, newContent)}
                  />
                )}
              </div>
            );
          })}
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
