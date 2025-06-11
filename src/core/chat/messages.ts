'use server'

import 'server-only'
import { db } from '@/core/db';
import { messages } from '@/core/db/schema';
import { eq } from 'drizzle-orm';

export async function createMessage(conversationId: string, role: 'user' | 'assistant', content: string, model: string) {
  try {
    const [newMessage] = await db.insert(messages).values({
      conversationId,
      role,
      content,
      model,
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

