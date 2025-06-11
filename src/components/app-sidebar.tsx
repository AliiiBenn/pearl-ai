"use client";

import * as React from "react";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import useUser from "@/core/auth/hook/use-user";
import {
  useGetConversationsByUserId,
  useDeleteConversation,
  useUpdateConversationName,
} from "@/core/chat/hooks/use-conversations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

// Import Dialog components
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: conversations,
    isLoading,
    isError,
  } = useGetConversationsByUserId(userId);
  const deleteConversationMutation = useDeleteConversation();
  const updateConversationNameMutation = useUpdateConversationName();

  // State to manage dialog visibility and the ID of the conversation to delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [conversationToDeleteId, setConversationToDeleteId] = React.useState<string | null>(null);

  // State to manage rename dialog visibility and data
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [conversationToRenameId, setConversationToRenameId] = React.useState<string | null>(null);
  const [newConversationName, setNewConversationName] = React.useState<string>("");

  const handleDeleteClick = (conversationId: string) => {
    setConversationToDeleteId(conversationId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteConversation = async () => {
    if (conversationToDeleteId) {
      try {
        await deleteConversationMutation.mutateAsync(conversationToDeleteId);
        // If the deleted conversation was the currently viewed one, navigate to the home page
        if (pathname === `/chat/${conversationToDeleteId}`) {
          router.push("/");
        }
        setIsDeleteDialogOpen(false); // Close dialog on success
        setConversationToDeleteId(null); // Clear the ID
      } catch (error) {
        console.error("Error deleting conversation:", error);
        // Optionally, show an error message to the user
        setIsDeleteDialogOpen(false); // Close dialog even on error
        setConversationToDeleteId(null);
      }
    }
  };

  const handleRenameClick = (conversationId: string, currentName: string) => {
    setConversationToRenameId(conversationId);
    setNewConversationName(currentName);
    setIsRenameDialogOpen(true);
  };

  const confirmRenameConversation = async () => {
    if (conversationToRenameId && newConversationName.trim() !== "") {
      try {
        await updateConversationNameMutation.mutateAsync({
          id: conversationToRenameId,
          newName: newConversationName.trim(),
        });
        setIsRenameDialogOpen(false);
        setConversationToRenameId(null);
        setNewConversationName("");
      } catch (error) {
        console.error("Error renaming conversation:", error);
        setIsRenameDialogOpen(false);
        setConversationToRenameId(null);
        setNewConversationName("");
      }
    }
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Pearl AI</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {isLoading && <SidebarMenuItem>Loading chats...</SidebarMenuItem>}
          {isError && <SidebarMenuItem>Error loading chats.</SidebarMenuItem>}
          {conversations && conversations.length > 0
            ? conversations.map((conversation) => (
                <SidebarMenuItem key={conversation.id}>
                  <div className="flex items-center justify-between w-full">
                    <SidebarMenuButton asChild className="flex-grow">
                      <Link
                        href={`/chat/${conversation.id}`}
                      >
                        {conversation.name}
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 ml-2"
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRenameClick(conversation.id, conversation.name)}>
                          <Edit className="mr-2 h-4 w-4" /> Rename Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(conversation.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuItem>
              ))
            : !isLoading &&
              !isError && <SidebarMenuItem>No chats yet.</SidebarMenuItem>}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteConversation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Chat Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for your chat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="new-chat-name"
              value={newConversationName}
              onChange={(e) => setNewConversationName(e.target.value)}
              placeholder="New chat name"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={confirmRenameConversation} disabled={newConversationName.trim() === ""}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
