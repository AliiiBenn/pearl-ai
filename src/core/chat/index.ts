'use server'

import 'server-only'
import { db } from '@/core/db';
import { conversations, messages } from '@/core/db/schema';
import { eq, and, desc, gt, ne } from 'drizzle-orm';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { revalidatePath } from 'next/cache';
import { getMessageById } from '@/core/chat/messages';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function createConversation(name: string, userId: string, selectedModel: string) {
  try {
    const [newConversation] = await db.insert(conversations).values({
      name,
      userId,
      selectedModel,
    }).returning();
    return newConversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function getConversation(id: string) {
  try {
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, id),
      with: {
        messages: {
          columns: {
            id: true,
            conversationId: true,
            role: true,
            content: true,
            model: true,
            createdAt: true,
            updatedAt: true,
            rawParts: true,
          },
        },
      },
    });

    if (conversation && conversation.messages) {
      conversation.messages = conversation.messages.map(msg => ({
        ...msg,
        content: msg.content === null ? '' : msg.content,
      }));
    }

    return conversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}

export async function updateConversationName(id: string, newName: string) {
  try {
    const [updatedConversation] = await db.update(conversations).set({ name: newName, updatedAt: new Date() }).where(eq(conversations.id, id)).returning();
    return updatedConversation;
  } catch (error) {
    console.error('Error updating conversation name:', error);
    throw error;
  }
}

export async function deleteConversation(id: string) {
  try {
    const [deletedConversation] = await db.delete(conversations).where(eq(conversations.id, id)).returning();
    return deletedConversation;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

export async function getConversationsByUserId(userId: string) {
  try {
    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: (conversations, { desc }) => [desc(conversations.updatedAt)],
    });
    return userConversations;
  } catch (error) {
    console.error('Error fetching conversations by user ID:', error);
    throw error;
  }
}

export async function generateConversationTitle(userMessage: string, aiResponse?: string): Promise<string> {
  try {
    let prompt: string;
    if (aiResponse) {
      prompt = `Based on the following user message and AI response, generate a concise conversation title (maximum 4 words).

User: ${userMessage}
AI: ${aiResponse}

Title:`;
    } else {
      prompt = `Based on the following user message, generate a concise conversation title (maximum 4 words).

User: ${userMessage}

Title:`;
    }

    const { text: generatedTitle } = await generateText({
      model: openrouter('deepseek/deepseek-chat-v3-0324:free'),
      prompt: prompt,
      maxTokens: 10,
    });

    const conciseTitle = generatedTitle.split(' ').slice(0, 4).join(' ').replace(/[^a-zA-Z0-9\s]/g, '');

    return conciseTitle;
  } catch (error) {
    console.error('Error generating conversation title:', error);
    return "New Chat";
  }
}

export async function updateMessageAndTruncateConversation(messageId: string, newContent: string) {
  try {
    const originalMessage = await getMessageById(messageId);

    if (!originalMessage) {
      throw new Error('Message not found.');
    }

    const { conversationId, createdAt: originalCreatedAt } = originalMessage;

    await db.update(messages)
      .set({ content: newContent, updatedAt: new Date() })
      .where(eq(messages.id, messageId));

    await db.delete(messages).where(
      and(
        eq(messages.conversationId, conversationId),
        gt(messages.createdAt, originalCreatedAt),
        ne(messages.id, messageId) // Exclure le message modifié
      )
    );

    revalidatePath(`/chat/${conversationId}`);

    return { success: true, conversationId };
  } catch (error) {
    console.error('Error updating message and truncating conversation:', error);
    throw error;
  }
}