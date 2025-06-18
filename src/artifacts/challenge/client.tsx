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
    const parsedContent = content ? JSON.parse(content) : {};
    const challengeData = {
      language: parsedContent.language || '',
      initialCode: parsedContent.initialCode || '',
      tests: parsedContent.tests || [],
      description: parsedContent.description || 'Challenge description.',
      isCompleted: parsedContent.isCompleted || false,
    };

    setMetadata(challengeData)
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
        language: challengeData.language || '',
        initialCode: challengeData.initialCode || '',
        tests: challengeData.tests || [],
        description: challengeData.description || 'Challenge description.',
        isCompleted: challengeData.isCompleted || false,
      }));

      initializeChallengeStore({
        id: (streamPart as any).documentId || 'generated-challenge',
        language: challengeData.language || '',
        initialCode: challengeData.initialCode || '',
        testCases: challengeData.tests || [],
        isCompleted: challengeData.isCompleted
    })
    }
  },
  content: ({ metadata, setMetadata, content: rawContent, onSaveContent, ...restOfProps }) => {
    const { isCompleted: isChallengeCompletedInStore, setIsCompleted } = useChallengeEditorStore();

    // useEffect(() => {
    //   const currentMetadataIsCompleted = metadata?.isCompleted;

    //   if (isChallengeCompletedInStore && !currentMetadataIsCompleted) {
    //     console.log("Challenge Accomplished! Saving completion status.");

    //     setMetadata((prevMetadata) => ({
    //       ...prevMetadata,
    //       isCompleted: true,
    //     }));

    //     onSaveContent(JSON.stringify({
    //       ...metadata,
    //       isCompleted: true,
    //       initialCode: useChallengeEditorStore.getState().code,
    //     }), false);
    //   }
    // }, [isChallengeCompletedInStore, metadata, setMetadata, onSaveContent]);

    useEffect(() => {
      if (metadata?.isCompleted !== isChallengeCompletedInStore) {
        setIsCompleted(metadata?.isCompleted ?? false);
      }
    }, [metadata?.isCompleted]);

    if (!metadata || !metadata.language || !metadata.tests) {
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
        isCompleted={metadata.isCompleted}
        onChange={(newCode: string) => {
          const updatedMetadata = {
            ...metadata,
            initialCode: newCode,
          };
          onSaveContent(JSON.stringify(updatedMetadata), true);
        }}
        onCompletion={() => {
          useChallengeEditorStore.getState().setIsCompleted(true);
          
          // 2. Mettre à jour les métadonnées de l'artefact
          const updatedMetadata = {
            ...metadata,
            isCompleted: true,
            initialCode: useChallengeEditorStore.getState().code,
          };
          
          setMetadata(updatedMetadata);

          onSaveContent(JSON.stringify(updatedMetadata), false);
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
