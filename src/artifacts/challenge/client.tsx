import { Artifact } from '@/components/create-artifact';
import { CodeEditor } from '@/components/code-editor';
import { PlayIcon, CheckIcon, CopyIcon, UndoIcon, RedoIcon } from 'lucide-react';
import { Console, ConsoleOutput, ConsoleOutputContent } from '@/components/console';
import { generateUUID } from '@/lib/utils';
import { toast } from 'sonner';

interface CodeChallengeMetadata {
  outputs: Array<ConsoleOutput>;
  language: string;
  initialCode: string;
  tests: Array<{ input: string; expectedOutput: string }>;
  description: string;
}

export const challengeArtifact = new Artifact<'challenge', CodeChallengeMetadata>({
  kind: 'challenge',
  description: 'Useful for creating and solving code challenges.',
  initialize: async ({ setMetadata, content }) => {
    let challengeData: CodeChallengeMetadata = {
      outputs: [],
      language: '',
      initialCode: '',
      tests: [],
      description: 'Loading challenge...',
    };

    try {
      if (content) {
        const parsedContent = JSON.parse(content);
        challengeData = {
          outputs: [],
          language: parsedContent.language || '',
          initialCode: parsedContent.initialCode || '',
          tests: parsedContent.tests || [],
          description: parsedContent.description || 'Challenge description.',
        };
      }
    } catch (error) {
      console.error('Error parsing challenge content:', error);
    }

    setMetadata(challengeData);
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === 'challenge-delta') {
      const challengeData = JSON.parse(streamPart.content as string);
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
      setMetadata((metadata) => ({
        ...metadata,
        language: challengeData.language,
        initialCode: challengeData.initialCode,
        tests: challengeData.tests,
        description: challengeData.description,
      }));
    }
  },
  content: ({ metadata, setMetadata, content: rawContent, onSaveContent, ...restOfProps }) => {
    const initialCode = metadata?.initialCode || '';
    const description = metadata?.description || 'Loading challenge description...';
    const tests = metadata?.tests || [];

    return (
      <>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">Code Challenge</h2>
          <p className="mb-4">{description}</p>

          <h3 className="text-lg font-semibold mb-2">Initial Code ({metadata?.language})</h3>
          <CodeEditor
            {...restOfProps}
            content={initialCode}
            onSaveContent={(newCodeContent) => {
              if (metadata) {
                const updatedMetadata = { ...metadata, initialCode: newCodeContent };
                onSaveContent(JSON.stringify(updatedMetadata), false);
              }
            }}
          />

          <h3 className="text-lg font-semibold mt-4 mb-2">Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test, index) => (
              <div key={index} className="border p-2 rounded-md">
                <p><strong>Input:</strong> <code>{test.input}</code></p>
                <p><strong>Expected Output:</strong> <code>{test.expectedOutput}</code></p>
              </div>
            ))}
          </div>

          {metadata?.outputs && (
            <Console
              consoleOutputs={metadata.outputs}
              setConsoleOutputs={() => {
                setMetadata({
                  ...metadata,
                  outputs: [],
                });
              }}
            />
          )}
        </div>
      </>
    );
  },
  actions: [
    {
      icon: <PlayIcon size={18} />,
      label: 'Run',
      description: 'Execute code without running tests for debugging.',
      onClick: async ({ content, setMetadata, metadata }) => {
        const runId = generateUUID();
        const outputContent: Array<ConsoleOutputContent> = [];

        setMetadata((prevMetadata) => ({
          ...prevMetadata,
          outputs: [
            ...prevMetadata.outputs,
            {
              id: runId,
              contents: [],
              status: 'in_progress',
            },
          ],
        }));

        try {
          // @ts-expect-error - loadPyodide is not defined
          const currentPyodideInstance = await globalThis.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
          });

          currentPyodideInstance.setStdout({
            batched: (output: string) => {
              outputContent.push({
                type: 'text',
                value: output,
              });
            },
          });

          await currentPyodideInstance.loadPackagesFromImports(metadata.initialCode, {
            messageCallback: (message: string) => {
              setMetadata((prevMetadata) => ({
                ...prevMetadata,
                outputs: [
                  ...prevMetadata.outputs.filter((output) => output.id !== runId),
                  {
                    id: runId,
                    contents: [{ type: 'text', value: message }],
                    status: 'loading_packages',
                  },
                ],
              }));
            },
          });

          await currentPyodideInstance.runPythonAsync(metadata.initialCode);

          setMetadata((prevMetadata) => ({
            ...prevMetadata,
            outputs: [
              ...prevMetadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: outputContent,
                status: 'completed',
              },
            ],
          }));
        } catch (error: any) {
          setMetadata((prevMetadata) => ({
            ...prevMetadata,
            outputs: [
              ...prevMetadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: [{ type: 'text', value: error.message }],
                status: 'failed',
              },
            ],
          }));
        }
      },
    },
    {
      icon: <CheckIcon size={18} />,
      label: 'Submit',
      description: 'Run tests and submit the challenge.',
      onClick: async ({ content, setMetadata, metadata, appendMessage }) => {
        const runId = generateUUID();
        const outputContent: Array<ConsoleOutputContent> = [];
        let allTestsPassed = true;

        setMetadata((prevMetadata) => ({
          ...prevMetadata,
          outputs: [
            ...prevMetadata.outputs,
            {
              id: runId,
              contents: [{ type: 'text', value: 'Running tests...' }],
              status: 'in_progress',
            },
          ],
        }));

        try {
          // @ts-expect-error - loadPyodide is not defined
          const currentPyodideInstance = await globalThis.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
          });

          currentPyodideInstance.setStdout({
            batched: (output: string) => {
              outputContent.push({
                type: 'text',
                value: output,
              });
            },
          });

          await currentPyodideInstance.loadPackagesFromImports(metadata.initialCode, {
            messageCallback: (message: string) => {
              setMetadata((prevMetadata) => ({
                ...prevMetadata,
                outputs: [
                  ...prevMetadata.outputs.filter((output) => output.id !== runId),
                  {
                    id: runId,
                    contents: [{ type: 'text', value: message }],
                    status: 'loading_packages',
                  },
                ],
              }));
            },
          });

          // Execute the user's code
          await currentPyodideInstance.runPythonAsync(metadata.initialCode);

          // Run tests
          for (const test of metadata.tests) {
            try {
              const testRunResult = await currentPyodideInstance.runPythonAsync(`
import io
import sys
from contextlib import redirect_stdout

# Redirect stdout to capture print statements
f = io.StringIO()
with redirect_stdout(f):
    ${metadata.initialCode.trim()}
    # Assuming the function to be tested is the first function defined in initialCode
    # You might need a more robust way to call the user's function based on challenge structure
    # For now, let's assume the function is \`solution\` and takes \`input\` as string
    output = solution(${test.input})
    print(output)

captured_output = f.getvalue().strip()
print(f'Test Input: ${test.input}')
print(f'Expected: ${test.expectedOutput}')
print(f'Got: {captured_output}')

if captured_output == '${test.expectedOutput}':
    print('Test Passed!')
else:
    print('Test Failed!')
                `);
                outputContent.push({ type: 'text', value: testRunResult });
                if (testRunResult.includes('Test Failed!')) {
                  allTestsPassed = false;
                }
            } catch (testError: any) {
                outputContent.push({ type: 'text', value: `Test failed for input ${test.input}: ${testError.message}` });
                allTestsPassed = false;
            }
          }

          setMetadata((prevMetadata) => ({
            ...prevMetadata,
            outputs: [
              ...prevMetadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: outputContent,
                status: allTestsPassed ? 'completed' : 'failed',
              },
            ],
          }));

          if (allTestsPassed) {
            appendMessage({
              role: 'user',
              content: 'I have successfully completed the code challenge!',
            });
            toast.success('Code Challenge Completed!');
          } else {
            toast.error('Some tests failed. Please review your code.');
          }

        } catch (error: any) {
          setMetadata((prevMetadata) => ({
            ...prevMetadata,
            outputs: [
              ...prevMetadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: [{ type: 'text', value: `Execution error: ${error.message}` }],
                status: 'failed',
              },
            ],
          }));
          toast.error('An error occurred during execution.');
        }
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy code to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [],
});
