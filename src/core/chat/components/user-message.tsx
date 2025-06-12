import { Message, MessageAvatar, MessageContent } from "@/components/message";
import { Button } from "@/components/ui/button";
import { PencilIcon, CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface UserMessageProps {
  content: string;
  userEmail: string;
  onMessageEdit: (newContent: string) => void;
}

export const UserMessage = ({ content, userEmail, onMessageEdit }: UserMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

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

  const handleSave = () => {
    onMessageEdit(editedContent);
    setIsEditing(false);
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
            onClick={() => setIsEditing(true)}
          >
            <PencilIcon size={16} />
          </Button>
        </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={5}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSave}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Message>
  );
};

