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
import { type Message as AIMessage } from "@ai-sdk/react";

interface AssistantMessageProps {
  message: AIMessage;
}

export const AssistantMessage = ({ message }: AssistantMessageProps) => {
  const [copied, setCopied] = useState(false);

  console.log("AssistantMessage received message for rendering:", message); // Log le message complet

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy message: ", err);
      });
  };

  const safeParts = Array.isArray(message?.parts) ? message.parts : [];
  console.log("AssistantMessage: safeParts for rendering:", safeParts); // Log safeParts

  const textContent = safeParts
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('');
  console.log("AssistantMessage: textContent derived for rendering:", textContent); // Log textContent

  return (
    <Message className="group w-2xl">
      <MessageAvatar src="/path/to/ai-avatar.png" alt="AI" fallback="AI" />
      <div className="relative flex flex-col items-start">
        {textContent && (
          <MessageContent markdown={true}>
            {textContent}
          </MessageContent>
        )}
        {safeParts.map((part, index) => {
          if (part.type === 'tool-invocation') {
            const toolInvocation = part.toolInvocation;
            if (toolInvocation && toolInvocation.toolName === 'generateCode' && toolInvocation.state === 'result') {
              const result = toolInvocation.result as { language: string; content: string };
              if (result && typeof result.language === 'string' && typeof result.content === 'string') {
                return (
                  <div key={index} className="relative bg-gray-800 rounded-md p-4 mt-2">
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <span className="text-sm text-gray-400">{result.language}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:bg-gray-700"
                        onClick={() => handleCopy(result.content)}
                      >
                        {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                      </Button>
                    </div>
                    <pre className="mt-6 text-white overflow-x-auto">
                      <code>{result.content}</code>
                    </pre>
                  </div>
                );
              }
            }
          }
          return null;
        })}
        {/* Buttons for copying/regenerating */}
        <div className="absolute -bottom-10 left-0 flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={() => handleCopy(textContent)}
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
