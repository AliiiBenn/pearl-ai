import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  unique,
  integer,
  serial,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId').notNull(),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet', 'challenge'] })
      .notNull()
      .default('text'),
    userId: uuid('userId').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

export const userUsageMetrics = pgTable('user_usage_metrics', {
  id: serial('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  metricName: varchar('metric_name', { length: 255 }).notNull(),
  metricValue: integer('metric_value').notNull().default(0),
  lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    unq: unique('user_id_metric_name_unq').on(table.userId, table.metricName),
  };
});



export const userRoleEnum = pgEnum('enum_user_informations_role', ['basic', 'lite', 'pro', 'max', 'admin']);
export const userPreferencesThemeEnum = pgEnum('enum_user_informations_preferences_theme', ['light', 'dark', 'system']);

// Define the structure for the nested preferences JSONB column
export type UserPreferences = {
  notifications?: {
    friends?: boolean;
  };
  emails?: {
    marketing?: boolean;
    affiliates?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
};


// ... (existing chat, document, suggestion, stream schemas)

export const userInformations = pgTable('user_informations', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(), // Matches Payload 'text' type
  name: varchar('name'), // Matches Payload 'text' type
  avatar: varchar('avatar'), // Matches Payload 'text' type
  initials: varchar('initials'), // Matches Payload 'text' type
  role: userRoleEnum('role').notNull().default('basic'), // Matches Payload 'select' type with default
  // permissions: jsonb('permissions'), // Omitted for now as it's a relationship, not a direct column
  preferences: jsonb('preferences').$type<UserPreferences>().default({ // Matches Payload 'group' type, stored as JSONB
    notifications: { friends: true },
    emails: { marketing: true, affiliates: true },
    theme: 'system',
  }),
  customerId: varchar('customer_id'), // Matches Payload 'text' type

  // Payload CMS automatically adds createdAt and updatedAt, often as timestamps without timezone
  // If your database schema uses timestamp with time zone, keep that.
  // If Payload manages these, they might be plain timestamp. I'll keep with timezone for robustness.
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type UserInformation = InferSelectModel<typeof userInformations>;