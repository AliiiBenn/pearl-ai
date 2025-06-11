'use server'

import 'server-only'
import { db } from '@/core/db';
import { conversations } from '@/core/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

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
      with: { messages: true },
    });
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
