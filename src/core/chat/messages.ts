'use server'

import 'server-only'
import { db } from '@/core/db';
import { messages } from '@/core/db/schema';
import { eq } from 'drizzle-orm';
import { type Message as AIMessage } from '@ai-sdk/react';

export async function createMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string | null,
  model: string,
  rawParts?: AIMessage['parts']
) {
  try {
    const [newMessage] = await db.insert(messages).values({
      conversationId,
      role,
      content,
      model,
      rawParts: rawParts ? rawParts : undefined,
    }).returning();
    return newMessage;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

export async function deleteMessage(id: string) {
  try {
    const [deletedMessage] = await db.delete(messages).where(eq(messages.id, id)).returning();
    return deletedMessage;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

export async function updateMessage(id: string, content: string) {
  try {
    const [updatedMessage] = await db.update(messages).set({ content, updatedAt: new Date() }).where(eq(messages.id, id)).returning();
    return updatedMessage;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
}

export async function getMessageById(id: string) {
  try {
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, id),
    });
    return message;
  } catch (error) {
    console.error('Error fetching message by ID:', error);
    throw error;
  }
}

