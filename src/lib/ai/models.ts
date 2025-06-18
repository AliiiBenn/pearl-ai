export const DEFAULT_CHAT_MODEL: string = 'gemini-2.5-flash-preview-05-20';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash Preview',
    description: 'Use This Model If You Want To Create Challenges',
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek Chat V3',
    description: 'DeepSeek Chat V3',
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1',
    description: 'DeepSeek R1',
  },
  {
    id: 'moonshotai/kimi-dev-72b:free',
    name: 'Moonshot AI Kimi',
    description: 'Moonshot AI Kimi',
  },
];
