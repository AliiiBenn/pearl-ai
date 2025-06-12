import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';

// Define the schema for a code challenge
export const codeChallengeSchema = z.object({
  language: z.string().describe('The programming language for the challenge (e.g., python, javascript).'),
  initialCode: z.string().describe('The initial code snippet for the challenge.'),
  tests: z.array(
    z.object({
      input: z.string().describe('The input for the test case.'),
      expectedOutput: z.string().describe('The expected output for the test case.'),
    })
  ).describe('An array of test cases with input and expected output.'),
  description: z.string().describe('A clear and concise description of the code challenge.'),
});

// Prompt for generating a new code challenge
const codeChallengePrompt = `You are an expert at creating engaging and well-structured code challenges.
When prompted with a title, generate a code challenge that includes:
- A programming language.
- Initial code (a function signature or basic structure).
- A clear description of the problem.
- A set of test cases, each with an input and its expected output.

The challenge should be solvable within a single function or script.
`;

// Prompt for updating a code challenge
const updateCodeChallengePrompt = (existingContent: string, description: string) => `
You are an expert at updating code challenges.
Given the existing code challenge content below, and a new description, update the code challenge.
Focus on improving the challenge based on the description, while maintaining its core purpose.

Existing Challenge:
\`\`\`json
${existingContent}
\`\`\`

New Description: ${description}
`;


export const challengeDocumentHandler = createDocumentHandler<'challenge'>({
  kind: 'challenge',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: codeChallengePrompt,
      prompt: title,
      schema: codeChallengeSchema,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;

        if (object) {
          // Send the entire object as a delta to the client
          dataStream.writeData({
            type: 'challenge-delta',
            content: JSON.stringify(object),
          });

          draftContent = JSON.stringify(object, null, 2);
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateCodeChallengePrompt(document.content ?? '', description),
      prompt: description,
      schema: codeChallengeSchema,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;

        if (object) {
          dataStream.writeData({
            type: 'challenge-delta',
            content: JSON.stringify(object),
          });

          draftContent = JSON.stringify(object, null, 2);
        }
      }
    }

    return draftContent;
  },
});
