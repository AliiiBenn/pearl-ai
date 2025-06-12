import { Chat } from './components/chat';

type ChatPageProps = {
  params: Promise<{
    chat_id: string;
  }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { chat_id } = await params;

  

  return (
      <Chat conversationId={chat_id} />
  );
}