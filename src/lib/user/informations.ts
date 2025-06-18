import 'server-only';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { userInformations } from '../db/schema';
import * as schema from '../db/schema';

import { ChatSDKError } from '../errors';

const client = postgres(process.env.POSTGRES_URL!); // biome-ignore lint: Forbidden non-null assertion.
export const db = drizzle(client, { schema });

export async function getUserInformationById({
  userId,
}: {
  userId: string;
}) {
  try {
    console.log('Fetching user information for userId:', userId);
    const [userInformation] = await db
      .select()
      .from(userInformations)
    return userInformation;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      `Failed to get user information for user ${userId}`,
    );
  }
}