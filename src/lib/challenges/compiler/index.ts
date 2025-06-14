export type CompilationResult = {
  success: boolean
  output: string
  error?: string
}

// Check if we're in a browser environment before using workers
export const isBrowser = typeof window !== 'undefined'

// JavaScript Worker
const createJavaScriptWorker = (code: string): Promise<CompilationResult> => {
  if (!isBrowser) {
    return Promise.resolve({
      success: false,
      output: '',
      error: 'JavaScript execution is only available in the browser',
    })
  }

  return new Promise((resolve) => {
    // Create a new worker from the external file, specifying it's a module
    const worker = new Worker(new URL('./workers/eval-worker.mjs', import.meta.url), {
      type: 'module',
    })

    // Handle messages from the worker
    worker.onmessage = (e) => {
      worker.terminate()
      resolve(e.data)
    }

    // Handle errors
    worker.onerror = (e) => {
      worker.terminate()
      resolve({
        success: false,
        output: '',
        error: e.message,
      })
    }

    // Send the code to the worker
    worker.postMessage(code)
  })
}

// TypeScript Worker
const createTypeScriptWorker = (code: string): Promise<CompilationResult> => {
  if (!isBrowser) {
    return Promise.resolve({
      success: false,
      output: '',
      error: 'TypeScript execution is only available in the browser',
    })
  }

  return new Promise((resolve) => {
    // Create a new worker from the external file, specifying it's a module
    const worker = new Worker(new URL('./workers/eval-worker.mjs', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (e) => {
      worker.terminate()
      resolve(e.data)
    }

    worker.onerror = (e) => {
      worker.terminate()
      resolve({
        success: false,
        output: '',
        error: e.message,
      })
    }

    worker.postMessage(code)
  })
}

// Python compilation using Pyodide
const compilePython = async (code: string): Promise<CompilationResult> => {
  if (!isBrowser) {
    return {
      success: false,
      output: '',
      error: 'Python execution is only available in the browser',
    }
  }

  try {
    // Load a new Pyodide instance for each run to ensure a clean state
    // @ts-expect-error - loadPyodide is not defined on globalThis in TS context, but it will be at runtime
    const pyodide = await globalThis.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
    })

    // Redirect stdout to capture print statements
    pyodide.setStdout({
      batched: (output: string) => {
        // In this simplified version, we just capture the final output as a string.
        // If we needed rich output (like images), this is where the logic would go.
        ;(pyodide as any)._capturedOutput = (pyodide as any)._capturedOutput
          ? (pyodide as any)._capturedOutput + output + '\n'
          : output + '\n'
      },
    })

    // Run the Python code
    await pyodide.runPythonAsync(code)

    // Get the captured stdout
    let output: string = (pyodide as any)._capturedOutput || ''
    output = output.trim()

    // Terminate Pyodide instance (optional, but good for memory if not reusing)
    // pyodide.destroy(); // Uncomment if you want to explicitly destroy the worker

    return {
      success: true,
      output,
    }
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes('PythonError:')) {
      const errorLines = errorMessage.split('\n')
      const pythonErrorLine = errorLines.find(
        (line) => line.includes('PythonError:') && !line.includes('Traceback'),
      )
      if (pythonErrorLine) {
        errorMessage = pythonErrorLine.replace('PythonError:', '').trim()
      }
    }

    return {
      success: false,
      output: '',
      error: errorMessage,
    }
  }
}

export async function compileCode(code: string, language: string): Promise<CompilationResult> {
  if (!isBrowser) {
    return {
      success: false,
      output: '',
      error: 'Code compilation is only available in the browser',
    }
  }

  try {
    switch (language) {
      case 'python':
        return await compilePython(code)
      case 'javascript':
        return await createJavaScriptWorker(code)
      case 'typescript':
        return await createTypeScriptWorker(code)
      default:
        return {
          success: false,
          output: '',
          error: `Unsupported language: ${language}`,
        }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      output: '',
      error: errorMessage,
    }
  }
}

type Language = 'python' | 'javascript' | 'typescript'

type Code = {
  content: string
  language: Language
}

type Test = {
  input: Code
  expectedOutput: Code
}

type TestResult = {
  success: boolean
  output: string
}

const mergeCode = (first: Code, second: Code): Code => {
  return {
    content: `${first.content}\n${second.content}`,
    language: first.language,
  }
}

export const testCode = async (code: Code, tests: Test[]): Promise<TestResult[]> => {
  const results: TestResult[] = []

  for (const test of tests) {
    const mergedCode = mergeCode(code, test.input)
    console.log(mergedCode)
    const result = await compileCode(mergedCode.content, mergedCode.language)

    results.push({
      success: result.output === test.expectedOutput.content,
      output: result.output,
    })
  }

  return results
}
