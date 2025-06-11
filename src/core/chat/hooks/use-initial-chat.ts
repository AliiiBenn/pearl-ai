"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createConversation } from "@/core/chat";
import { createMessage } from "@/core/chat/messages";
import useUser from "@/core/auth/hook/use-user";

export function useInitialChat() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: user } = useUser();

  const createConversationMutation = useMutation({
    mutationFn: ({ name, userId, selectedModel }: { name: string; userId: string; selectedModel: string }) => createConversation(name, userId, selectedModel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["userConversations"] });
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      role,
      content,
      model,
    }: {
      conversationId: string;
      role: "user" | "assistant";
      content: string;
      model: string;
    }) => createMessage(conversationId, role, content, model),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", data.conversationId],
      });
    },
  });

  const initiateChat = async (userMessage: string, selectedModel: string) => {
    if (!user?.id || !userMessage.trim()) {
      console.error("User not logged in or user message is empty.");
      return;
    }

    try {
      // 1. Create a new conversation
      const newConversation = await createConversationMutation.mutateAsync({
        name: userMessage.substring(0, 50),
        userId: user.id,
        selectedModel,
      });

      // 2. Create the first user message in the new conversation
      await createMessageMutation.mutateAsync({
        conversationId: newConversation.id,
        role: "user",
        content: userMessage,
        model: selectedModel,
      });

      // 3. Redirect to the new chat page
      router.push(`/chat/${newConversation.id}`);
    } catch (error) {
      console.error("Error initiating new chat:", error);
      throw error; // Re-throw to allow component to handle errors if needed
    }
  };

  return {
    initiateChat,
    isLoading:
      createConversationMutation.isPending || createMessageMutation.isPending,
    isError:
      createConversationMutation.isError || createMessageMutation.isError,
    error: createConversationMutation.error || createMessageMutation.error,
  };
}
