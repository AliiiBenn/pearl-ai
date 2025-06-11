'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMessage, updateMessage, deleteMessage } from '@/core/chat/messages'; // Ensure the path is correct

// Hook to create a message
export function useCreateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, role, content, model }: { conversationId: string; role: 'user' | 'assistant'; content: string; model: string }) =>
      createMessage(conversationId, role, content, model),
    onSuccess: (data) => {
      // Invalidate the specific conversation cache so new messages are fetched
      queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] });
    },
  });
}

// Hook to update a message
export function useUpdateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updateMessage(id, content),
    onSuccess: (data, variables) => {
      // Invalidate the cache of the conversation to which the message belongs.
      // Note: For precise invalidation, updateMessage should ideally return the conversation ID,
      // or the cache management needs to be handled differently.
      // Currently, this invalidates all 'conversation' queries, which might be too broad.
      // A better approach would be to find the conversation ID of the updated message.
      // If the updateMessage function doesn't return conversationId, you might need a mechanism to retrieve it.
      queryClient.invalidateQueries({ queryKey: ['conversation'] }); // This is a generic invalidation
    },
  });
}

// Hook to delete a message
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: (data, variables) => {
      // Invalidate the cache of the conversation to which the message belonged.
      // Similar to updateMessage, you would need the conversation ID for targeted invalidation.
      queryClient.invalidateQueries({ queryKey: ['conversation'] }); // Generic invalidation
    },
  });
}
