'use client'

import { cn } from '@/lib/utils'
import { Editor, OnMount } from '@monaco-editor/react'
import { useChallengeEditorStore } from '../store'
import { useRef, useEffect } from 'react'

type ChallengeEditorProps = {
  onChange?: (code: string) => void
}

export const ChallengeEditor = ({ onChange }: ChallengeEditorProps) => {
  const { currentLanguage, code, setCode } = useChallengeEditorStore()
  const editorRef = useRef<any>(null)

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      onChange?.(value)
      console.log("handleCodeChange: currentLanguage is", currentLanguage)
    }
  }

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1a1b26',
      },
    })
    monaco.editor.setTheme('custom-dark')
    editor.focus()
  }

  return (
    <Editor
      height="100%"
      language={currentLanguage}
      value={code}
      onChange={handleCodeChange}
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: currentLanguage === 'python' ? 4 : 2,
        automaticLayout: true,
        wordWrap: 'on',
        lineNumbers: 'on',
        glyphMargin: true,
        folding: true,
        lineDecorationsWidth: 10,
        bracketPairColorization: { enabled: true },
      }}
    />
  )
}

export const ChallengeEditorContainer = ({ children }: { children: React.ReactNode }) => {
  const { isTerminalOpen } = useChallengeEditorStore()

  return (
    <div
      className={cn(
        'flex-grow transition-all duration-300 ease-in-out',
        isTerminalOpen ? 'h-[calc(70%-40px)]' : 'h-[calc(100%-80px)]',
      )}
    >
      {children}
    </div>
  )
}
