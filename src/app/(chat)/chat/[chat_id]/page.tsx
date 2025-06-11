import { Chat } from './components/chat';

type ChatPageProps = {
  params: Promise<{
    chat_id: string;
  }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { chat_id } = await params;


  return (
    <div className="relative flex flex-col h-[calc(100vh_-_var(--header-height))]">
      <Chat conversationId={chat_id} />
    </div>
  );
}