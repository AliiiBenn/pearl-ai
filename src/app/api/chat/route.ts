import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, selectedModel } = await req.json();

  console.log("API Route: Received messages:", messages);
  console.log("API Route: Selected model:", selectedModel);

  const result = streamText({
    model: openrouter(selectedModel || 'deepseek/deepseek-chat-v3-0324:free'),
    messages,
    tools: {
      generateCode: {
        description: 'Génère un bloc de code avec la syntaxe spécifiée.',
        parameters: z.object({
          language: z.string().describe('Le langage de programmation du code (ex: typescript, python, javascript).'),
          content: z.string().describe('Le contenu du code à générer.'),
        }),
        execute: async ({ language, content }: { language: string; content: string }) => {
          console.log("API Route: Executing generateCode tool with:", { language, content });
          return { language, content };
        },
      },
    },
  });

  return result.toDataStreamResponse();
}