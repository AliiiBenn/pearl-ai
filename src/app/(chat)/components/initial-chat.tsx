"use client";

import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import React, { useState } from "react";
import { ModelsSelector } from "@/core/chat/components/models-selector";
import { availableModels } from "@/core/ai/types";
import { useInitialChat } from "@/core/chat/hooks/use-initial-chat";

export function InitialChatContent() {
  return (
    <div className="relative flex flex-col h-[calc(100vh_-_var(--header-height))] items-center justify-center">
      <Title />
      <div className="w-full max-w-3xl px-3 pb-3 md:px-5 md:pb-5 bg-background">
        <InitialChatInput />
      </div>
    </div>
  );
}

const Title = () => {
  return (
    <h1 className="scroll-m-20 text-center text-4xl font-semibold tracking-tight lg:text-5xl pb-8">
      What do you want to learn?
    </h1>
  );
};

const InitialChatInput = () => {
  const [promptInput, setPromptInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(availableModels[0].name);
  const { initiateChat, isLoading } = useInitialChat();

  const handleCreateChat = async () => {
    if (!promptInput.trim()) {
      console.error("Prompt is empty.");
      return;
    }
    await initiateChat(promptInput, selectedModel);
  };

  return (
    <PromptInput className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs">
      <div className="flex flex-col">
        <PromptInputTextarea
          placeholder="Ask anything"
          className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
        />

        <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
          <div className="flex items-center gap-2">
            <ModelsSelector
              value={selectedModel}
              onValueChange={setSelectedModel}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              className="size-9 rounded-full"
              onClick={handleCreateChat}
              disabled={isLoading || !promptInput.trim()}
            >
              <ArrowUp size={18} />
            </Button>
          </div>
        </PromptInputActions>
      </div>
    </PromptInput>
  );
};
