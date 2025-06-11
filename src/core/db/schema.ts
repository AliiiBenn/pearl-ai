import { pgTable, text, varchar, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Table des conversations
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(), // Nom de la conversation
  userId: uuid('user_id').notNull(),
  selectedModel: varchar('selected_model', { length: 256 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // Note: Vous devrez gérer la mise à jour manuellement ou via un trigger DB
});

// Relations pour la table des conversations
export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages), // Une conversation a plusieurs messages
}));

// Table des messages
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }), // Clé étrangère vers la conversation
  role: varchar('role', { length: 50 }).notNull(), // Rôle du message: 'user' ou 'assistant'
  content: text('content').notNull(), // Contenu du message
  model: varchar('model', { length: 256 }).notNull(), // Nom du modèle IA utilisé (ex: 'gpt-3.5-turbo')
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // Note: Vous devrez gérer la mise à jour manuellement ou via un trigger DB
});

// Relations pour la table des messages
export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  // Plus de relation 'model' ici car c'est maintenant un simple champ varchar
}));
