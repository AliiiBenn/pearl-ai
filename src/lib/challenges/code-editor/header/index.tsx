'use client'

import { Button } from '@/components/ui/button'
import { Play, Send, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useChallengeEditorStore } from '../store'

type CodeFunction = () => void

export const LanguageSelector = () => {
  const { currentLanguage, availableLanguages } = useChallengeEditorStore()

  if (availableLanguages.length === 1) {
    return <span className="font-medium text-sm">{availableLanguages[0].label}</span>
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentLanguage}>
        <SelectTrigger className="w-[155px] h-8">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* {showPythonStatus && <PyodideLoadingStatus pyodideStatus={pyodideStatus} />} */}
    </div>
  )
}

export const RunButton = ({ onRun }: { onRun?: CodeFunction }) => {
  const { run: runCode, isLoadingRun } = useChallengeEditorStore((state) => state)

  const handleRun = () => {
    // ? We add a custom run handler here to add behaviors when the code is runned, for example we could save the code before running it.
    if (onRun) onRun()
    runCode()
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      className="h-8"
      onClick={handleRun}
      disabled={isLoadingRun}
    >
      {isLoadingRun ? (
        <Loader2 size={14} className="mr-1 animate-spin" />
      ) : (
        <Play size={14} className="mr-1" />
      )}
      Run
    </Button>
  )
}

export const SubmitButton = ({ onSubmit }: { onSubmit?: CodeFunction }) => {
  const { submit: submitCode, isLoadingSubmit } = useChallengeEditorStore((state) => state)

  const handleSubmit = () => {
    // ? The same structure applies here. This permit us to add behaviors when the code is submitted.
    if (onSubmit) onSubmit()
    submitCode()
  }

  return (
    <Button
      variant="default"
      size="sm"
      className="h-8"
      onClick={handleSubmit}
      disabled={isLoadingSubmit}
    >
      {isLoadingSubmit ? (
        <Loader2 size={14} className="mr-1 animate-spin" />
      ) : (
        <Send size={14} className="mr-1" />
      )}
      Submit
    </Button>
  )
}

export const ChallengeIDEHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-b flex items-center justify-between px-3 py-2 bg-muted/20">
      {children}
    </div>
  )
}

export const ChallengeIDEHeaderLeftPart = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center">{children}</div>
}

export const ChallengeIDEHeaderRightPart = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-2">{children}</div>
}
