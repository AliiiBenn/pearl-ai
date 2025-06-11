import { streamText } from 'ai';

import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, selectedModel } = await req.json();

  const result = streamText({
    model: openrouter(selectedModel || 'deepseek/deepseek-chat-v3-0324:free'),
    messages,
  });

  return result.toDataStreamResponse();
}