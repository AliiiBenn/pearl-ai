import type { ChatModel } from './models';

// NEW: Define UserType based on your Supabase user categorization (e.g., guest vs authenticated)
type UserType = 'guest' | 'authenticated'; // Or 'free' | 'premium' if you have plans

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account (or guest sessions)
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
  },

  /*
   * For users with an account (authenticated via Supabase)
   */
  authenticated: { // CHANGE: Renamed 'regular' to 'authenticated' for clarity with Supabase
    maxMessagesPerDay: 100,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
  },

  /*
   * TODO: For users with an account and a paid membership (if applicable, add more user types here)
   */
};
