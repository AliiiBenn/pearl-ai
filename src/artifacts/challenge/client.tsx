import { Artifact } from '@/components/create-artifact';
import { CodeEditor } from '@/components/code-editor';
import { PlayIcon, CheckIcon, CopyIcon, UndoIcon, RedoIcon, Send } from 'lucide-react';
import { Console, ConsoleOutput, ConsoleOutputContent } from '@/components/console';
import { generateUUID } from '@/lib/utils';
import { toast } from 'sonner';
import { ChallengeEditor, ChallengeEditorContainer } from '@/lib/challenges/code-editor/editor';
import { ChallengeIDE } from '@/lib/challenges/code-editor';
import { useChallengeEditorStore } from '@/lib/challenges/code-editor/store';
import { useEffect } from 'react';

interface CodeChallengeMetadata {
  outputs: Array<ConsoleOutput>;
  language: string;
  initialCode: string;
  tests: Array<{ input: string; expectedOutput: string }>;
  description: string;
  isCompleted: boolean;
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
      isCompleted: false,
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
          isCompleted: parsedContent.isCompleted || false,
        };
      }
    } catch (error) {
      console.error('Error parsing challenge content:', error);
      challengeData = {
        outputs: [],
        language: '',
        initialCode: '',
        tests: [],
        description: 'Failed to load challenge data or new challenge.',
        isCompleted: false,
      };
    }

    setMetadata(challengeData);
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    const { initialize: initializeChallengeStore } = useChallengeEditorStore.getState();

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
        isCompleted: challengeData.isCompleted || false,
      }));

      initializeChallengeStore({
        id: (streamPart as any).documentId || 'generated-challenge',
        language: challengeData.language,
        initialCode: challengeData.initialCode,
        testCases: challengeData.tests,
      });
    }
  },
  content: ({ metadata, setMetadata, content: rawContent, onSaveContent, ...restOfProps }) => {
    const { isCompleted: isChallengeCompletedInStore } = useChallengeEditorStore();

    useEffect(() => {
      if (isChallengeCompletedInStore && !metadata.isCompleted) {
        console.log("Challenge Accomplished! Saving completion status.");
        
        setMetadata((prevMetadata) => ({
          ...prevMetadata,
          isCompleted: true,
        }));

        onSaveContent(JSON.stringify({
          ...metadata,
          isCompleted: true,
          initialCode: useChallengeEditorStore.getState().code,
        }), false);
      }
    }, [isChallengeCompletedInStore, metadata, setMetadata, onSaveContent]);

    if (!metadata || !metadata.language) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          Loading challenge data...
        </div>
      );
    }

    const challenge = {
      id: restOfProps.documentId || 'default-challenge-id',
      language: metadata.language as any,
      initialCode: metadata.initialCode,
      testCases: metadata.tests,
    };

    return (
      <ChallengeIDE
        challenge={challenge}
        onChange={(newCode: string) => {
          const updatedMetadata = {
            ...metadata,
            initialCode: newCode,
          };
          onSaveContent(JSON.stringify(updatedMetadata), true);
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
        const { run } = useChallengeEditorStore.getState();
        run();
      },
    },
    {
      icon: <Send size={18} />,
      label: 'Submit',
      description: 'Run tests and submit the challenge.',
      variant: "default",
      onClick: async ({ content, setMetadata, metadata, appendMessage }) => {
        const { submit } = useChallengeEditorStore.getState();
        submit();
      },
    },
  ],
  toolbar: [],
});
