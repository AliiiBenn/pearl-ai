import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { createClient } from '@/utils/supabase/server';
import { getUserInformationById } from '@/lib/db/queries';
import { getRemainingCredits } from '@/lib/user/credits';

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

  const remainingCredits = await getRemainingCredits(user?.id);
  console.log(remainingCredits);

  const userInformation = await getUserInformationById({ userId: user?.id });
  const isAdmin = userInformation?.role === 'admin';


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
        remainingCredits={remainingCredits}
        isAdmin={isAdmin}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
