import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { createClient } from '@/utils/supabase/server';
import { getUserInformationById } from '@/lib/db/queries';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  console.log(user.id)
  console.log(await getUserInformationById({ userId: user.id }));

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelIdFromCookie?.value || DEFAULT_CHAT_MODEL}
        initialVisibilityType="private"
        isReadonly={false}
        session={user}
        autoResume={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
