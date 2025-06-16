import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId, getUserInformationById } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { Polar } from "@polar-sh/sdk";
import { getRemainingCredits } from '@/lib/user/credits';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (chat.visibility === 'private') {
    if (!user) {
      return notFound();
    }

    if (user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  const currentSession = { user };

  const remainingCredits = await getRemainingCredits(user?.id as string);

  const userInformation = await getUserInformationById({ userId: user?.id as string });
  const isAdmin = userInformation?.role === 'admin';


  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={user?.id !== chat.userId}
          session={currentSession.user}
          autoResume={true}
          remainingCredits={remainingCredits}
          isAdmin={isAdmin}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        initialChatModel={chatModelFromCookie.value}
        initialVisibilityType={chat.visibility}
        isReadonly={user?.id !== chat.userId}
        session={currentSession.user}
        autoResume={true}
        remainingCredits={remainingCredits}
        isAdmin={isAdmin}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
