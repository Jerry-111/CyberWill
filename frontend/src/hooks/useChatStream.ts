import { useState, useRef } from 'react';
import { getApiUrl } from '@/lib/api-config';

interface UseChatStreamProps {
    onChunk?: (chunk: string) => void;
    onFinish?: (fullMessage: string) => void;
}

interface UseChatStreamReturn {
    isLoading: boolean;
    sendMessage: (content: string, profileContext?: string) => Promise<void>;
    stopGeneration: () => void;
}

export function useChatStream({ onChunk, onFinish }: UseChatStreamProps = {}): UseChatStreamReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    const sendMessage = async (content: string, profileContext?: string) => {
        if (!content.trim()) return;

        setIsLoading(true);
        abortControllerRef.current = new AbortController();
        let fullMessage = "";

        try {
            const response = await fetch(`${getApiUrl()}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    session_id: sessionId,
                    profile_context: profileContext
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            if (!response.body) {
                throw new Error('No response body');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep the incomplete line in the buffer

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);

                        if (data.session_id) {
                            setSessionId(data.session_id);
                        }

                        if (data.type === 'answer') {
                            const chunk = data.content;
                            fullMessage += chunk;
                            if (onChunk) {
                                onChunk(chunk);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing JSON chunk:', e);
                    }
                }
            }

            if (onFinish) {
                onFinish(fullMessage);
            }

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sending message:', error);
                // Optionally handle error via callback if needed
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    return {
        isLoading,
        sendMessage,
        stopGeneration,
    };
}
