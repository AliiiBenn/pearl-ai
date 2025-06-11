'use client'

// Suppression des importations des composants maintenant encapsulés
// import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/chat-container"
// import { AssistantMessage } from "@/core/chat/components/assistant-message"
// import { UserMessage } from "@/core/chat/components/user-message"
import { User } from "@supabase/supabase-js"
import { conversations, messages } from "@/core/db/schema"
import { useGetConversation } from "@/core/chat/hooks/use-conversations"
import useUser from "@/core/auth/hook/use-user"
import { useState, useRef, useEffect } from "react"
import { useChat, type Message as AIChatMessage } from '@ai-sdk/react'
import { useCreateMessage } from '@/core/chat/hooks/use-messages'
import { Conversation } from "@/core/chat/components/conversation";
import { ChatInput } from "@/core/chat/components/chat-input";

// Suppression des importations de l'UI pour l'input, maintenant dans ChatInput
// import {
//   PromptInput,
//   PromptInputAction,
//   PromptInputActions,
//   PromptInputTextarea,
// } from "@/components/prompt-input"
// import { Button } from "@/components/ui/button"
// import { ArrowUp, Globe, Mic, MoreHorizontal, Plus } from "lucide-react"

// Infer the base types from the schema
type BaseConversation = typeof conversations.$inferSelect;
type BaseMessage = typeof messages.$inferSelect;

// Extend the Conversation type to include the 'messages' relation
type ConversationWithMessages = BaseConversation & {
  messages: BaseMessage[];
};

export const Chat = ({ conversationId }: { conversationId: string }) => {
    const { data: conversation, isLoading, isError } = useGetConversation(conversationId);
    const { data: user } = useUser();

    const createMessageMutation = useCreateMessage();

    // Transform database messages to AI SDK format for useChat
    const initialMessages = conversation?.messages?.map(msg => ({
      id: msg.id,
      role: msg.role === 'user' ? 'user' : (msg.role === 'assistant' ? 'assistant' : 'system'),
      content: msg.content,
    })) || [];

    const {
      messages: aiChatMessages,
      input,
      handleInputChange,
      handleSubmit: handleAIChatSubmit,
      isLoading: isAiLoading,
      setMessages,
    } = useChat({
      initialMessages: initialMessages as AIChatMessage[],
      id: conversationId,
      onFinish: async (message: AIChatMessage) => {
        if (message.role === 'assistant') {
          try {
            const aiMessage = await createMessageMutation.mutateAsync({
              conversationId: conversationId,
              role: 'assistant',
              content: message.content,
              model: 'ai-sdk-default',
            });
            console.log("AI message saved (chat page):", aiMessage);
          } catch (error) {
            console.error("Error saving AI message (chat page):", error);
          }
        }
      }
    });

    // Update useChat messages when conversation data changes (e.g., after initial fetch)
    useEffect(() => {
      if (conversation && conversation.messages && aiChatMessages.length !== conversation.messages.length) {
        setMessages(initialMessages as AIChatMessage[]);
      }
    }, [conversation, initialMessages, setMessages, aiChatMessages.length]);

    // New useEffect to trigger AI response for the initial user message
    useEffect(() => {
        // Trigger AI response only if:
        // 1. Loading is complete and there's no error
        // 2. A conversation exists
        // 3. There's exactly one message in aiChatMessages (meaning it's the initial user message)
        // 4. The single message is from the user role
        // 5. There is no existing assistant message in the conversation yet (to prevent re-triggering)
        if (!isLoading && !isError && conversation && aiChatMessages.length === 1 && aiChatMessages[0].role === 'user') {
            const hasAssistantMessage = conversation.messages.some(msg => msg.role === 'assistant');
            if (!hasAssistantMessage) {
                console.log("Triggering AI response for initial user message.");
                const syntheticEvent = new Event('submit', {
                    bubbles: true,
                    cancelable: true,
                }) as unknown as React.FormEvent<HTMLFormElement>;
                handleAIChatSubmit(syntheticEvent);
            }
        }
    }, [isLoading, isError, conversation, aiChatMessages, handleAIChatSubmit]);

    const handlePromptInputChange = (value: string) => {
      handleInputChange({
        target: { value },
      } as React.ChangeEvent<HTMLTextAreaElement>)
    }

    const handleCustomSubmit = async () => {
      if (!user?.id) {
        console.error("User not logged in or user ID not available.");
        return;
      }

      const userMessageContent = input.trim();
      if (!userMessageContent) return;

      try {
        const newUserMessage = await createMessageMutation.mutateAsync({
          conversationId: conversationId,
          role: 'user',
          content: userMessageContent,
          model: 'user-input',
        });
        console.log("User message saved (chat page):", newUserMessage);

        const syntheticEvent = new Event('submit', {
          bubbles: true,
          cancelable: true,
        }) as unknown as React.FormEvent<HTMLFormElement>;

        handleAIChatSubmit(syntheticEvent); // Trigger AI response
      } catch (error) {
        console.error("Error saving user message (chat page):", error);
      }
    };

    if (isLoading) {
      return <div>Loading conversation...</div>;
    }

    if (isError) {
      return <div>Error loading conversation.</div>;
    }

    if (!conversation) {
      return <div>Conversation not found.</div>;
    }

    return (
      <div className="relative flex flex-col h-[calc(100vh_-_var(--header-height))]">
        <Conversation messages={aiChatMessages} userEmail={user?.email ?? ""} />

        <ChatInput
          isLoading={isAiLoading}
          value={input}
          onValueChange={handlePromptInputChange}
          onSubmit={handleCustomSubmit}
        />
      </div>
    );
};