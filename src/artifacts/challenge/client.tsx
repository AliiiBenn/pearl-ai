import { Artifact } from '@/components/create-artifact';
import { CodeEditor } from '@/components/code-editor';
import { PlayIcon, CheckIcon, CopyIcon, UndoIcon, RedoIcon, Send } from 'lucide-react';
import { Console, ConsoleOutput, ConsoleOutputContent } from '@/components/console';
import { generateUUID } from '@/lib/utils';
import { toast } from 'sonner';
import { ChallengeEditor, ChallengeEditorContainer } from '@/lib/challenges/code-editor/editor';
import { ChallengeIDE } from '@/lib/challenges/code-editor';
import { useChallengeEditorStore } from '@/lib/challenges/code-editor/store';

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
    if (!metadata) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          Loading challenge data...
        </div>
      );
    }

    const initialCode = metadata.initialCode || '';
    const description = metadata.description || 'Loading challenge description...';
    const tests = metadata.tests || [];

    console.log("Intiial", initialCode)

    return (
      <ChallengeIDE
        challenge={{
          language: metadata.language as any,
          initialCode: metadata.initialCode,
          testCases: metadata.tests,
        }}
      />
    );
  },
  actions: [
    {
      icon: <PlayIcon size={18} />,
      label: 'Run',
      description: 'Execute code without running tests for debugging.',
      onClick: async ({ content, setMetadata, metadata }) => {
        const { run } = useChallengeEditorStore.getState(); // Get state directly from store
        run(); // Call the run function from the store
      },
    },
    {
      icon: <Send size={18} />,
      label: 'Submit',
      description: 'Run tests and submit the challenge.',
      variant: "default",
      onClick: async ({ content, setMetadata, metadata, appendMessage }) => {
        const { submit } = useChallengeEditorStore.getState(); // Get state directly from store
        submit(); // Call the submit function from the store
      },
    },
  ],
  toolbar: [],
});
