import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/core/db/schema';

const connectionString = process.env.DATABASE_URL!;
// Désactive prefetch pour le mode pooler transaction
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });