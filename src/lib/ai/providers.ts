import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';


const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openrouter('google/gemini-2.5-flash-preview-05-20'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openrouter('google/gemini-2.5-flash-preview-05-20'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openrouter('deepseek/deepseek-chat-v3-0324:free'),
        'artifact-model': openrouter('google/gemini-2.5-flash-preview-05-20'),
      }
    });
