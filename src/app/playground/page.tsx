'use client'; // This component needs to be a client component

import { notFound, redirect } from "next/navigation";
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { useState } from 'react'; // Pour gérer l'input
import { z } from 'zod';
import { Markdown } from "@/components/markdown"; // Pour rendre le challengeStatement
import { CodeChallenge, codeChallengeSchema } from "../api/playground-object/route";

export default function Page() {
    if (process.env.NODE_ENV === 'production') {
        return notFound();
    }

    const [languageInput, setLanguageInput] = useState('');
    const [topicInput, setTopicInput] = useState('');
    const [generatedChallenge, setGeneratedChallenge] = useState<CodeChallenge | undefined>(undefined);

    const { object, submit, isLoading, error, stop } = useObject<CodeChallenge>({
        api: '/api/playground-object',
        schema: codeChallengeSchema,
        onFinish: ({ object, error }) => {
            if (object) {
                console.log('Challenge de code généré et validé:', object);
                setGeneratedChallenge(object);
            }
            if (error) {
                console.error('Erreur de validation de schéma ou autre:', error);
            }
        },
        onError: (err) => {
            console.error('Erreur de requête:', err);
        },
    });

    const handleSubmit = () => {
        if (languageInput.trim() && topicInput.trim()) {
            submit({ language: languageInput, topic: topicInput, selectedModel: 'deepseek/deepseek-chat-v3-0324:free' });
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Code Challenge Generator Playground</h1>
            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    placeholder="Language (e.g., Python)"
                    className="flex-1 p-2 border rounded-md"
                />
                <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Topic (e.g., loops, data structures)"
                    className="flex-1 p-2 border rounded-md"
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !languageInput.trim() || !topicInput.trim()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                    {isLoading ? 'Generating...' : 'Generate Challenge'}
                </button>
                {isLoading && (
                    <button
                        onClick={() => stop()}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                        Stop
                    </button>
                )}
            </div>

            {error && (
                <div className="text-red-500 mb-4">
                    An error occurred: {error.message || 'Unknown error'}
                </div>
            )}

            {generatedChallenge && (
                <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-2">Generated Code Challenge:</h2>
                    <p className="mb-2"><strong>Language:</strong> {generatedChallenge.language}</p>
                    <h3 className="text-lg font-semibold mb-1">Challenge Statement:</h3>
                    <Markdown>{generatedChallenge.challengeStatement}</Markdown>

                    <h4 className="text-md font-semibold mt-4 mb-1">Initial Code:</h4>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-x-auto text-sm">
                        <code>{generatedChallenge.initialCode}</code>
                    </pre>

                    <h4 className="text-md font-semibold mt-4 mb-1">Test Cases:</h4>
                    {generatedChallenge.tests && generatedChallenge.tests.length > 0 ? (
                        <div className="space-y-2">
                            {generatedChallenge.tests.map((test, index) => (
                                <div key={index} className="p-2 border rounded-md bg-white dark:bg-gray-900">
                                    <p className="font-medium">Test {index + 1}:</p>
                                    <p>Input: <code>{JSON.stringify(test.input)}</code></p>
                                    <p>Expected Output: <code>{JSON.stringify(test.expectedOutput)}</code></p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No test cases provided.</p>
                    )}
                </div>
            )}

            {/* Optionally display the partial object for debugging */}
            {/* {object && (
                <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-2">Streaming Object (Partial):</h2>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-x-auto text-sm">
                        <code>{JSON.stringify(object, null, 2)}</code>
                    </pre>
                </div>
            )} */}
        </div>
    );
}