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
        'gemini-2.5-flash-preview-05-20': openrouter('google/gemini-2.5-flash-preview-05-20'),
        'deepseek/deepseek-chat-v3-0324:free': openrouter('deepseek/deepseek-chat-v3-0324:free'),
        'deepseek/deepseek-r1-0528:free': openrouter('deepseek/deepseek-r1-0528:free'),
        'moonshotai/kimi-dev-72b:free': openrouter('moonshotai/kimi-dev-72b:free'),
        'title-model': openrouter('deepseek/deepseek-chat-v3-0324:free'),
        'artifact-model': openrouter('google/gemini-2.5-flash-preview-05-20'),
      }
    });
