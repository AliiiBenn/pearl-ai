import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { compileCode } from '../compiler'
import { submitCode } from '../submissions/index.client'
// import { submitCode } from '@/core/challenges/submissions/index.client'
import { AcceptedSubmission } from '../submissions/index.client'

// Define supported languages
export const SUPPORTED_LANGUAGES = ['python', 'javascript', 'typescript'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Renamed from ProgrammingLanguage to reflect it's the challenge's language
type ChallengeLanguage = {
  value: SupportedLanguage
  label: string
}

type TestResult = {
  success: boolean
  input: string
  expectedOutput: string
  actualOutput: string
}

// Renamed from CodeVersion to ChallengeData to reflect the single challenge concept
type ChallengeData = {
  id: string
  language: SupportedLanguage
  initialCode: string
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
  onCompletion?: () => void
  isCompleted?: boolean
}

export type TerminalTab = 'output' | 'tests'

interface ChallengeEditorStore {
  submit: () => Promise<void>
  run: () => void
  // availableLanguages will now hold only the single language of the challenge
  availableLanguages: ChallengeLanguage[]
  // No longer need changeLanguage if only one language is present per challenge
  // changeLanguage: (language: SupportedLanguage) => void;
  currentLanguage: SupportedLanguage
  // codeByLanguage becomes simply 'code'
  code: string
  setCode: (code: string) => void // Simplified setCode
  isTerminalOpen: boolean
  toggleTerminal: () => void
  activeTerminalTab: TerminalTab
  setActiveTerminalTab: (tab: TerminalTab) => void
  executionOutput: string
  setExecutionOutput: (output: string) => void
  testResults: TestResult[]
  setTestResults: (results: TestResult[]) => void
  // Initialize now accepts a single ChallengeData object
  initialize: (challenge: ChallengeData) => void
  isLoadingRun: boolean
  isLoadingSubmit: boolean
  setIsLoadingRun: (isLoading: boolean) => void
  setIsLoadingSubmit: (isLoading: boolean) => void
  // Add testCases to the store directly
  testCases: Array<{ input: string; expectedOutput: string }>;
  challengeId: string | undefined
  challengeInitialCode: string
  isCompleted: boolean
  setIsCompleted: (completed: boolean) => void
  onCompletion?: () => void
}

export const useChallengeEditorStore = create<ChallengeEditorStore>()(
  persist(
    (set, get) => ({
      availableLanguages: [],
      currentLanguage: 'javascript', // Default, will be overridden by initialize
      code: '', // Default, will be overridden by initialize
      isTerminalOpen: true,
      activeTerminalTab: 'output',
      executionOutput: '',
      testResults: [],
      isLoadingRun: false,
      isLoadingSubmit: false,
      testCases: [], // Initialize empty
      challengeId: undefined,
      challengeInitialCode: '',
      isCompleted: false,

      setIsLoadingRun: (isLoading) => set({ isLoadingRun: isLoading }),
      setIsLoadingSubmit: (isLoading) => set({ isLoadingSubmit: isLoading }),

      // Initialize with a single challenge object
      initialize: (challenge: ChallengeData) => {
        if (!challenge) return;

        set({
          code: challenge.initialCode,
          currentLanguage: challenge.language,
          testResults: [],
          testCases: challenge.testCases,
          availableLanguages: [{ value: challenge.language, label: challenge.language.charAt(0).toUpperCase() + challenge.language.slice(1) }],
          challengeId: challenge.id,
          challengeInitialCode: challenge.initialCode,
          onCompletion: challenge.onCompletion, 
          isCompleted: challenge.isCompleted
        });

      },

      run: async () => {
        const {
          currentLanguage,
          code, // Use 'code' directly
          setExecutionOutput,
          setActiveTerminalTab,
          toggleTerminal,
          setIsLoadingRun,
        } = get()

        setIsLoadingRun(true)
        setExecutionOutput(`Running ${currentLanguage} code...`)
        setActiveTerminalTab('output')
        if (!get().isTerminalOpen) {
          toggleTerminal()
        }

        try {
          const { success, output, error } = await compileCode(code, currentLanguage)
          if (success) {
            setExecutionOutput(output)
          } else {
            setExecutionOutput(`Error:\n${error}`)
          }
        } catch (err) {
          setExecutionOutput(
            `Compilation failed:\n${err instanceof Error ? err.message : String(err)}`,
          )
        } finally {
          setIsLoadingRun(false)
        }
      },

      submit: async () => {
        const {
          currentLanguage,
          code, // Use 'code' directly
          setTestResults,
          setActiveTerminalTab,
          toggleTerminal,
          testCases, // Get testCases from store
          setIsLoadingSubmit,
          setIsCompleted,
          onCompletion,
        } = get()

        setIsLoadingSubmit(true)
        setActiveTerminalTab('tests')
        if (!get().isTerminalOpen) {
          toggleTerminal()
        }

        if (!testCases || testCases.length === 0) {
          setTestResults([
            {
              success: false,
              input: '',
              expectedOutput: '',
              actualOutput: 'Error: No test cases found for this language',
            },
          ])
          setIsLoadingSubmit(false)
          return
        }

        try {
          console.log(code)
          const submission = await submitCode(
            { content: code, language: currentLanguage },
            testCases.map((tc) => ({
              input: { content: tc.input, language: currentLanguage },
              expectedOutput: { content: tc.expectedOutput, language: currentLanguage },
            })),
          )

          if (submission.type === 'accepted') {
            setIsCompleted(true)
            console.log("Challenge Accomplished!")
            if (get().onCompletion) {
              console.log("hey")
              get().onCompletion()
            }
          } else {
            setIsCompleted(false)
          }

          const testResults = await Promise.all(
            testCases.map(async (tc, index) => { // Use testCases directly
              const testCode = `${code}\n${tc.input}`


              const result = await compileCode(testCode, currentLanguage)


              let cleanOutput = result.success ? result.output : result.error || 'No output'
              cleanOutput = cleanOutput.replace(new RegExp(`^${tc.input}[\n\r]*`), '').trim()

              // This part assumes 'submission' exists and has 'testsPassed'
              // Since 'submitCode' is commented, this logic needs review.
              // For now, setting success based on expected vs actual output
              const success = cleanOutput === tc.expectedOutput;

              return {
                success: success, // Simplified for now
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                actualOutput: cleanOutput,
              }
            }),
          )

          setTestResults(testResults)
        } catch (error) {
          setIsCompleted(false)
          setTestResults([
            {
              success: false,
              input: '',
              expectedOutput: '',
              actualOutput: `Submission failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ])
        } finally {
          setIsLoadingSubmit(false)
        }
      },
      // changeLanguage is no longer needed if only one language is handled at a time
      // changeLanguage: (language) => {
      //   set({ currentLanguage: language })
      // },
      setCode: (code) => { // Simplified setCode
        set({ code: code })
      },
      toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
      setActiveTerminalTab: (tab) => set({ activeTerminalTab: tab }),
      setExecutionOutput: (output) => set({ executionOutput: output }),
      setTestResults: (results) => set({ testResults: results }),
      setIsCompleted: (completed) => set({ isCompleted: completed }),
    }),
    {
      name: 'challenge-editor-store',
      partialize: (state) => ({
        code: state.code,
        currentLanguage: state.currentLanguage,
        challengeId: state.challengeId,
        challengeInitialCode: state.challengeInitialCode,
        testCases: state.testCases,
        isCompleted: state.isCompleted
      }),
    },
  ),
)
