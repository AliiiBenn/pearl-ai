'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMessage,
  updateMessage,
  deleteMessage,
} from '@/core/chat/messages'; // Le chemin d'importation des fonctions serveur a été ajusté
import { updateMessageAndTruncateConversation } from '..';
import { type Message as AIMessage } from '@ai-sdk/react';

// Hook to create a message
export function useCreateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, role, content, model, rawParts }: { 
      conversationId: string; 
      role: 'user' | 'assistant'; 
      content: string | null; // Rendre content nullable
      model: string; 
      rawParts?: AIMessage['parts']; // Ajouter rawParts
    }) =>
      createMessage(conversationId, role, content, model, rawParts), // Passer rawParts
    onSuccess: (data) => {
      // Invalidate the specific conversation cache so new messages are fetched
      queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] });
    },
  });
}

// Hook to update a message (l'ancienne fonction updateMessage est maintenant remplacée par updateMessageAndTruncateConversation pour ce cas d'usage)
export function useUpdateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updateMessage(id, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation'] }); // Generic invalidation
    },
  });
}

// Hook to delete a message
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation'] }); // Generic invalidation
    },
  });
}

// Nouveau hook pour mettre à jour un message et tronquer la conversation
export function useUpdateMessageAndTruncate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, newContent }: { messageId: string; newContent: string }) =>
      updateMessageAndTruncateConversation(messageId, newContent),
    onSuccess: (data) => {
      // Invalider la requête spécifique pour la conversation afin de re-fetcher les messages
      if (data.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] });
      }
    },
  });
}
