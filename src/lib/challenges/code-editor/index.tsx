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
  id: string
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
  challenge: Challenge
  onCompletion?: () => void
  isCompleted?: boolean
}

export const ChallengeIDE = (props: ChallengeIDEProps) => {
  const { initialize, challengeId: currentChallengeIdInStore } = useChallengeEditorStore()

  useEffect(() => {
    if (props.challenge.id !== currentChallengeIdInStore) {
      initialize({
        ...props.challenge,
        onCompletion: props.onCompletion,
        isCompleted: props.isCompleted
      })
    }
  }, [props.challenge.id, initialize, currentChallengeIdInStore, props.challenge, props.onCompletion, props.isCompleted])

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
