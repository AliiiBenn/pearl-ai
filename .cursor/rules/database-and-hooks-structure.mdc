---
description: 
globs: 
alwaysApply: true
---
# Project Structure Guide

This project utilizes Drizzle ORM for database interactions and React Query for client-side data fetching and mutations.

## Database Migrations

Database schema migrations are managed by Drizzle ORM.
- Migration files are located in the `drizzle/` directory, e.g., [0000_calm_vertigo.sql](mdc:drizzle/0000_calm_vertigo.sql). These files contain SQL statements to define and alter the database schema.

## Database Core

The core database setup is located in `src/core/db/`.
- [src/core/db/index.ts](mdc:src/core/db/index.ts): This file handles the database connection and initializes Drizzle ORM, integrating the database schema.
- [src/core/db/schema.ts](mdc:src/core/db/schema.ts): This file defines the Drizzle ORM schema for your database tables, such as `conversations` and `messages`, and their relations.

## Client-Side Hooks

Client-side data fetching and mutations are managed using React Query hooks, located in `src/hooks/`.
- [src/hooks/use-conversations.ts](mdc:src/hooks/use-conversations.ts): Contains React Query hooks for managing conversation-related operations (fetching a single conversation, creating, updating, and deleting conversations). These hooks interact with the server-side functions defined in [src/core/chat/index.ts](mdc:src/core/chat/index.ts).
- [src/hooks/use-messages.ts](mdc:src/hooks/use-messages.ts): Contains React Query hooks for managing message-related operations (creating, updating, and deleting messages). These hooks interact with the server-side functions defined in [src/core/chat/messages.ts](mdc:src/core/chat/messages.ts).

