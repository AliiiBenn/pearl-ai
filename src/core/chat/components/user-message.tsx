import { Message, MessageAvatar, MessageContent } from "@/components/message";
import { Button } from "@/components/ui/button";
import { PencilIcon, CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";

interface UserMessageProps {
  content: string;
  userEmail: string;
}

export const UserMessage = ({ content, userEmail }: UserMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy message: ", err);
      });
  };

  return (
    <Message className="group w-3xl">
      <MessageAvatar src={`https://avatar.vercel.sh/${userEmail}`} alt={userEmail} fallback={userEmail?.charAt(0).toUpperCase()} />
      <div className="flex items-start gap-2">
        <MessageContent className="bg-transparent max-w-2xl">{content}</MessageContent>
      </div>
      <div className="flex justify-end items-center h-full ml-auto mr-12">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleCopy}
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <PencilIcon size={16} />
          </Button>
        </div>
    </Message>
  );
};

