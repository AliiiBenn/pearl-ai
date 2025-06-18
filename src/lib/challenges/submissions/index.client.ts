import { CompilationResult, compileCode } from '@/lib/challenges/compiler'

/**
 * Base type for any code submission.
 */
export type Submission = {
  testsPassed: number
  testsTotal: number
  code: {
    language: string
    content: string
  }
}

/**
 * Represents a submission that resulted in a runtime error.
 */
export type RunTimeErrorSubmission = Submission & {
  type: 'runtimeError'
  error: string
  lastExpectedOutput: { output: string }[]
}

/**
 * Represents a submission that passed some tests but failed due to a wrong answer.
 */
export type WrongAnswerSubmission = Submission & {
  type: 'wrongAnswer'
  input: string
  output: string
  expectedOutput: string
}

/**
 * Represents a submission that exceeded the allocated time limit.
 */
export type TimeLimitExceededSubmission = Submission & {
  type: 'timeLimitExceeded'
  lastExpectedOutput: { output: string }[]
}

/**
 * Represents a submission that passed all tests.
 */
export type AcceptedSubmission = Submission & {
  type: 'accepted'
}

/**
 * Supported programming languages.
 */
type Language = 'python' | 'javascript' | 'typescript'

/**
 * Represents a piece of code submitted for compilation or testing.
 */
type CodeSubmission = {
  content: string
  language: Language
}

/**
 * Defines a single test case with input and expected output.
 */
type Test = {
  input: CodeSubmission
  expectedOutput: CodeSubmission
}

/**
 * Details of a failed test case, used internally by `runAllTests`.
 */
type TestResultErrorDetails = {
  input: string
  expectedOutput: string
  actualOutput?: string
  error?: string
  type: 'runtimeError' | 'wrongAnswer' | 'timeLimitExceeded'
}

/**
 * Creates the base submission object that is common to all submission types.
 * 
 * @param code - The submitted code
 * @param testsTotal - The total number of tests in the challenge
 * @returns The base submission object
 */
const createBaseSubmission = (
  code: { content: string; language: string },
  testsTotal: number,
): Submission => ({
  testsPassed: 0,
  testsTotal,
  code,
})

/**
 * Time limit for code execution in milliseconds (5 seconds).
 */
const TIME_LIMIT = 5000

/**
 * Creates a promise that rejects after the time limit, used to enforce execution time constraints.
 * 
 * @returns A promise that rejects with 'Time Limit Exceeded' error
 */
const createTimeoutPromise = (): Promise<never> =>
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Time Limit Exceeded'))
    }, TIME_LIMIT)
  })

/**
 * Prepares code for execution by combining input with the main code.
 * 
 * @param code - The main code to be executed
 * @param input - The input to be provided to the code
 * @returns The combined code string with input prepended
 */
const prepareCodeWithInput = (code: string, input: string): string => `${code}\n${input}`

/**
 * Compares the actual output with the expected output.
 * 
 * @param output - The actual output from code execution
 * @param expectedOutput - The expected output defined in the test case
 * @returns True if outputs match (after trimming), false otherwise
 */
const compareOutputs = (output: string, expectedOutput: string): boolean =>
  output.trim() === expectedOutput.trim()

/**
 * Runs all tests for a given code submission and returns the number of passed tests 
 * and details of the first failed test if any.
 * 
 * @param code - The code submission to test
 * @param tests - Array of test cases to run
 * @returns Object containing the number of passed tests and optional details of the first failure
 */
const runAllTests = async (
  code: CodeSubmission,
  tests: Test[],
): Promise<{ passed: number; failedTest?: TestResultErrorDetails }> => {
  let testsPassed = 0

  for (const test of tests) {
    const codeWithInput = prepareCodeWithInput(code.content, test.input.content)

    try {
      const result = (await Promise.race([
        compileCode(codeWithInput, code.language),
        createTimeoutPromise(),
      ])) as CompilationResult

      if (!result.success) {
        return {
          passed: testsPassed,
          failedTest: {
            type: 'runtimeError',
            input: test.input.content,
            expectedOutput: test.expectedOutput.content,
            error: result.error || 'Runtime Error',
          },
        }
      }

      if (!compareOutputs(result.output, test.expectedOutput.content)) {
        return {
          passed: testsPassed,
          failedTest: {
            type: 'wrongAnswer',
            input: test.input.content,
            expectedOutput: test.expectedOutput.content,
            actualOutput: result.output.trim(),
          },
        }
      }

      testsPassed++
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Time Limit Exceeded') {
        return {
          passed: testsPassed,
          failedTest: {
            type: 'timeLimitExceeded',
            input: test.input.content,
            expectedOutput: test.expectedOutput.content,
          },
        }
      }
      return {
        passed: testsPassed,
        failedTest: {
          type: 'runtimeError',
          input: test.input.content,
          expectedOutput: test.expectedOutput.content,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }
  return { passed: testsPassed }
}

/**
 * Submits code for evaluation against a set of test cases.
 * 
 * @param code - The code submission to evaluate
 * @param tests - Array of test cases to run against the code
 * @returns A submission result object indicating success or failure with details
 */
export const submitCode = async (
  code: CodeSubmission,
  tests: Test[],
): Promise<
  AcceptedSubmission | RunTimeErrorSubmission | WrongAnswerSubmission | TimeLimitExceededSubmission
> => {
  const baseSubmission = createBaseSubmission(code, tests.length)
  const { passed, failedTest } = await runAllTests(code, tests)

  if (failedTest) {
    if (failedTest.type === 'runtimeError') {
      return {
        ...baseSubmission,
        testsPassed: passed,
        type: 'runtimeError',
        error: failedTest.error || 'Unknown error',
        lastExpectedOutput: [{ output: failedTest.expectedOutput }],
      }
    } else if (failedTest.type === 'wrongAnswer') {
      return {
        ...baseSubmission,
        testsPassed: passed,
        type: 'wrongAnswer',
        input: failedTest.input,
        output: failedTest.actualOutput || '',
        expectedOutput: failedTest.expectedOutput,
      }
    } else if (failedTest.type === 'timeLimitExceeded') {
      return {
        ...baseSubmission,
        testsPassed: passed,
        type: 'timeLimitExceeded',
        lastExpectedOutput: [{ output: failedTest.expectedOutput }],
      }
    }
  }

  return {
    ...baseSubmission,
    testsPassed: passed,
    type: 'accepted',
  } as AcceptedSubmission
}
