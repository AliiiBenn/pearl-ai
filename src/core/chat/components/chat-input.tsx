"use client"

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-input"
import { Button } from "@/components/ui/button"
import { ArrowUp, Globe, Mic, MoreHorizontal, Plus } from "lucide-react"
import type React from "react"

interface ChatInputProps {
  isLoading: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
}

export function ChatInput({ isLoading, value, onValueChange, onSubmit }: ChatInputProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-3xl px-3 pb-3 md:px-5 md:pb-5 bg-background">
      <PromptInput
        isLoading={isLoading}
        value={value}
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
      >
        <div className="flex flex-col">
          <PromptInputTextarea
            placeholder="Say something..."
            className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
          />

          <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
            <div className="flex items-center gap-2">
              <PromptInputAction tooltip="Add a new action">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full"
                >
                  <Plus size={18} />
                </Button>
              </PromptInputAction>

              <PromptInputAction tooltip="Search">
                <Button variant="outline" className="rounded-full">
                  <Globe size={18} />
                  Search
                </Button>
              </PromptInputAction>

              <PromptInputAction tooltip="More actions">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full"
                >
                  <MoreHorizontal size={18} />
                </Button>
              </PromptInputAction>
            </div>
            <div className="flex items-center gap-2">
              <PromptInputAction tooltip="Voice input">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full"
                >
                  <Mic size={18} />
                </Button>
              </PromptInputAction>

              <Button
                type="submit"
                size="icon"
                disabled={!value.trim() || isLoading}
                className="size-9 rounded-full"
              >
                <ArrowUp size={18} />
              </Button>
            </div>
          </PromptInputActions>
        </div>
      </PromptInput>
    </div>
  )
}
