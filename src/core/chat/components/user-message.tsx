import { Message, MessageAvatar, MessageContent } from "@/components/message";
import { Button } from "@/components/ui/button";
import { PencilIcon, CopyIcon } from "lucide-react";

interface UserMessageProps {
  content: string;
  userEmail: string;
}

export const UserMessage = ({ content, userEmail }: UserMessageProps) => {
  return (
    <Message className="group w-2xl">
      <MessageAvatar src={`https://avatar.vercel.sh/${userEmail}`} alt={userEmail} fallback={userEmail?.charAt(0).toUpperCase()} />
      <div className="relative flex flex-col items-end">
        <MessageContent className="bg-transparent">{content}</MessageContent>
        <div className="absolute -bottom-8 right-0 flex">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <CopyIcon size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <PencilIcon size={16} />
          </Button>
        </div>
      </div>
    </Message>
  );
};

