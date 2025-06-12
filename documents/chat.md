#### Change message content

This feature allows users to modify the content of their previously sent messages within a conversation. This is crucial for correcting typos, clarifying statements, or re-phrasing a query to get a different AI response.

**Core Functionality:**

*   **Triggering the Edit Dialog:**
    *   Users will be able to initiate the message editing process by clicking on a designated "pencil" icon associated with each user message in the chat interface. This icon will become visible upon hovering over the message.

*   **Displaying the Edit Dialog:**
    *   Upon clicking the edit icon, a modal dialog will appear. This dialog will display the current content of the message within an editable text area.
    *   The dialog will include "Save changes" and "Cancel" buttons, allowing the user to either confirm their edits or discard them.

*   **Optimistic UI Update:**
    *   When a user confirms their changes by clicking "Save changes", the chat interface will immediately reflect the updated message content, providing instant visual feedback. This is an optimistic update, meaning the UI assumes the change will succeed before the database confirms it.

*   **Database Update:**
    *   Simultaneously with the optimistic UI update, the system will send a request to the backend to persist the modified message content in the database. Error handling should be in place to gracefully manage potential database update failures.

*   **Conversation Truncation:**
    *   Following a successful message edit (both in UI and database), all subsequent messages in the conversation (messages that were sent *after* the edited message) will be removed from the chat history. This ensures that the AI's future responses are based on the corrected context, effectively restarting the conversation from the point of modification.

*   **AI Response Regeneration:**
    *   Once the message is updated and the conversation history is truncated, the AI system will automatically generate a new response. This new response will be based on the revised conversation context, starting from the edited message.

#### Restart AI Response

This feature provides users with the ability to regenerate an AI's response, offering flexibility to retry with the same model or explore alternative responses by switching to a different AI model. This is particularly useful when the initial AI response is not satisfactory, or when a user wishes to compare outputs from various models.

**Core Functionality:**

*   **Triggering the Regeneration Menu:**
    *   A "refresh" icon will be present on each AI message in the chat interface. Clicking this icon will open a dropdown menu, presenting options related to regenerating the AI's response.

*   **Displaying Model Selection:**
    *   The dropdown menu will include a list of all available AI models, sourced from `src/core/ai/types.ts`. Each model will be presented by its display name.
    *   Additionally, there will be an explicit option to "Regenerate with Current Model," allowing users to simply re-run the last prompt with the same AI model that generated the original response.

*   **Initiating Regeneration with Chosen Model:**
    *   Upon selecting an option from the dropdown menu (either a specific model or "Regenerate with Current Model"), the system will initiate the process of regenerating the AI's response.

*   **Conversation Context for Regeneration:**
    *   When regeneration is triggered, the system will use the conversation history up to the message *preceding* the AI message being regenerated as the context for the new AI call.
    *   The AI message that was initially targeted for regeneration, along with any subsequent messages, will be logically removed or ignored for the purpose of generating the new response.

*   **Displaying New AI Response:**
    *   The newly generated AI response, based on the selected model and the updated conversation context, will then be displayed in the chat interface, replacing the previous AI response and any subsequent messages.

#### Backend Integration for Model Selection (API Route)

To support the AI response regeneration with different models, the API route responsible for handling chat requests (`src/app/api/chat/route.ts`) must be updated. This update will ensure that the selected model from the frontend is correctly received and utilized when making calls to the AI provider.

**Core Functionality:**

*   **Receiving Selected Model:**
    *   The `POST` request to `src/app/api/chat/route.ts` will include the `selectedModel` identifier, which will be the name of the AI model chosen by the user from the regeneration menu.

*   **Dynamic Model Selection:**
    *   The API route will use this `selectedModel` value to dynamically select the appropriate AI model from the configured AI provider (e.g., OpenRouter). This mechanism will be consistent with how models are already selected for initial chat responses.

*   **Contextual AI Call:**
    *   The AI model will then be invoked with the appropriate conversation context, which, as described in the "Conversation Context for Regeneration" section, will be the messages preceding the regenerated AI response.

This ensures that the backend correctly processes the user's choice of AI model for any regenerated responses, maintaining flexibility and control over the AI's behavior.

#### User Settings

This feature introduces a dedicated settings area within the user profile dropdown, allowing users to manage their chat data and customize the AI's behavior through a system prompt.

**Core Functionality:**

*   **Accessing Settings Dialog:**
    *   A new "Settings" option will be added to the user's profile dropdown menu (located in `src/components/nav-user.tsx`).
    *   Clicking this option will open a modal dialog, serving as the central hub for user-specific configurations.

*   **Delete All Chats Option:**
    *   Within the settings dialog, a prominent option will be available to "Delete all chats."
    *   Upon confirmation (e.g., via an additional confirmation step within the dialog), this action will trigger a server-side process.
    *   The server action will be responsible for irrevocably deleting all conversations associated with the logged-in user, including all messages within those conversations, from the database. This operation must be handled with care to prevent accidental data loss.

*   **System Prompt Configuration:**
    *   The settings dialog will include an input field where users can define a custom "System Prompt."
    *   This system prompt will serve as a foundational instruction or context for the AI, influencing all subsequent AI responses within any conversation.
    *   The prompt's content will be stored persistently (e.g., in user preferences or a dedicated configuration).

*   **Applying System Prompt in AI Requests:**
    *   When a chat request is made to the AI (handled by `src/app/api/chat/route.ts`), the configured system prompt will be included in the messages sent to the AI model.
    *   The system prompt should be positioned appropriately in the `messages` array sent to the AI, typically as the first message with a 'system' role, to ensure it guides the AI's behavior from the outset of any interaction.
    *   This ensures that the user's custom instructions are consistently applied across all conversations.