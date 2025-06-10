

type ChatPageProps = {
  params: Promise<{
    chat_id: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chat_id } = await params
  return <div>ChatPage {chat_id}</div>
}