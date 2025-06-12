import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamObject } from 'ai';
import { z } from 'zod';

export const codeChallengeSchema = z.object({
  challengeStatement: z.string().describe('The statement or description of the coding challenge.'),
  initialCode: z.string().describe('The initial code snippet or function signature for the challenge, in the specified language.'),
  language: z.string().describe('The programming language of the challenge (e.g., Python, JavaScript).'),
  tests: z.array(
    z.object({
      input: z.array(z.any()).describe('An array of inputs for the function (can be strings, numbers, arrays, etc.).'),
      expectedOutput: z.any().describe('The expected output for the given input (can be string, number, boolean, object, etc.).'),
    })
  ).describe('An array of test cases, each with an input and an expected output.'),
});

export type CodeChallenge = z.infer<typeof codeChallengeSchema>;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { language, topic, selectedModel } = await req.json();

  const result = streamObject<CodeChallenge>({
    model: openrouter(selectedModel || 'deepseek/deepseek-chat-v3-0324:free'),
    schema: codeChallengeSchema,
    prompt: `Generate a code challenge in JSON format for the following specifications, according to the provided schema:
Language: ${language}
Topic: ${topic}

Ensure the initialCode is a runnable snippet (e.g., a function definition).
The input for tests should be an array, even if there's only one argument.
The expectedOutput for tests should be the raw expected value (string, number, boolean, object etc.).

Example JSON structure for a Python string reversal challenge:
\`\`\`json
{
  "challengeStatement": "Write a Python function that reverses a string.",
  "initialCode": "def reverse_string(s):\n    # Your code here\n    pass",
  "language": "Python",
  "tests": [
    {"input": ["hello"], "expectedOutput": "olleh"},
    {"input": ["world"], "expectedOutput": "dlrow"}
  ]
}
\`\`\`

Now, generate the code challenge. Only respond with the JSON.`,
  });

  return result.toTextStreamResponse();
}


