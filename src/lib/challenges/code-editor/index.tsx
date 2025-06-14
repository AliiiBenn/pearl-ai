'use client'

import { ChallengeEditorContainer, ChallengeEditor } from './editor'
import { TerminalTabs, TerminalContent } from './footer'
import {
  ChallengeIDEHeader,
  ChallengeIDEHeaderLeftPart,
  ChallengeIDEHeaderRightPart,
  LanguageSelector,
  RunButton,
  SubmitButton,
} from './header'
import { useChallengeEditorStore } from './store'
import { useEffect } from 'react'

const ChallengeIDEContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-full flex flex-col border-t overflow-hidden">{children}</div>
}

type Challenge = {
  language: "javascript" | "python" | "typescript"
  initialCode: string
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
}

type ChallengeIDEProps = {
  onRun?: () => void
  onSubmit?: () => void
  onChange?: (code: string) => void
  challenge?: Challenge
}

export const ChallengeIDE = (props: ChallengeIDEProps) => {
  const initialize = useChallengeEditorStore((state) => state.initialize)

  console.log(props.challenge?.testCases)


  useEffect(() => {
    if (props.challenge) {
      initialize(props.challenge)
    }
  }, [props.challenge, initialize])

  return (
    <ChallengeIDEContainer>
      <ChallengeEditorContainer>
        <ChallengeEditor onChange={props.onChange} />
      </ChallengeEditorContainer>

      <TerminalTabs />
      <TerminalContent />
    </ChallengeIDEContainer>
  )
}
