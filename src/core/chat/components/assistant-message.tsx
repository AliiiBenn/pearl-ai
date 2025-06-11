import { Markdown } from "@/components/markdown";
import { Message, MessageAvatar, MessageContent } from "@/components/message";
import { Button } from "@/components/ui/button";
import { CopyIcon, MoreVertical, RefreshCcw, CheckIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface AssistantMessageProps {
  content: string;
}

export const AssistantMessage = ({ content }: AssistantMessageProps) => {
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
    <Message className="group w-2xl">
      <MessageAvatar src="/path/to/ai-avatar.png" alt="AI" fallback="AI" />
      <div className="relative flex flex-col items-start">
        <MessageContent markdown={true}>
          {content}
        </MessageContent>
        <div className="absolute -bottom-10 left-0 flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={handleCopy}
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
              >
                <RefreshCcw size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="cursor-pointer">
                <RefreshCcw size={16} className="mr-2" />
                <span>Regénérer</span>
              </DropdownMenuItem>
              <DropdownMenuItem>Option 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Message>
  );
};
