'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createConversation, getConversation, updateConversationName, deleteConversation, getConversationsByUserId } from '@/core/chat';

// Hook to fetch a specific conversation
export function useGetConversation(conversationId: string) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId, // Only runs the query if conversationId is defined
  });
}

// Hook to create a conversation
export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, userId, selectedModel }: { name: string; userId: string; selectedModel: string }) =>
      createConversation(name, userId, selectedModel),
    onSuccess: () => {
      // Invalidate the conversations cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Invalidate conversations by user ID cache
      queryClient.invalidateQueries({ queryKey: ['userConversations'] });
    },
  });
}

// Hook to update a conversation's name
export function useUpdateConversationName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) => updateConversationName(id, newName),
    onSuccess: (data) => {
      // Invalidate the specific conversation cache and potentially the list
      queryClient.invalidateQueries({ queryKey: ['conversation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['userConversations'] });
    },
  });
}

// Hook to delete a conversation
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: () => {
      // Invalidate the conversations cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['userConversations'] });
    },
  });
}

// New hook to fetch all conversations by user ID
export function useGetConversationsByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ['userConversations', userId],
    queryFn: () => getConversationsByUserId(userId!),
    enabled: !!userId, // Only runs the query if userId is defined
  });
}
