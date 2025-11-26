import { useState, useRef } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface UseChatStreamReturn {
    messages: Message[];
    input: string;
    setInput: (input: string) => void;
    isLoading: boolean;
    sendMessage: () => Promise<void>;
    stopGeneration: () => void;
}

export function useChatStream(): UseChatStreamReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Create a placeholder for the assistant's message
        setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: '' },
        ]);

        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.content }),
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

                        setMessages((prev) => {
                            const newMessages = [...prev];
                            const lastMessageIndex = newMessages.length - 1;
                            const lastMessage = newMessages[lastMessageIndex];

                            if (lastMessage.role === 'assistant') {
                                if (data.type === 'answer') {
                                    // Create a new object to avoid mutation
                                    newMessages[lastMessageIndex] = {
                                        ...lastMessage,
                                        content: (lastMessage.content || '') + data.content
                                    };
                                }
                            }
                            return newMessages;
                        });
                    } catch (e) {
                        console.error('Error parsing JSON chunk:', e);
                    }
                }
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sending message:', error);
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
                ]);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    return {
        messages,
        input,
        setInput,
        isLoading,
        sendMessage,
        stopGeneration,
    };
}
