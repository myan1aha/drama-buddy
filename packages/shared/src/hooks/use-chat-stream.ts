import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, DramaContext, SSEEvent } from '../types';

interface PetUpdate {
  level: number;
  stage: string;
  mood: string;
  exp: number;
  expToNext: number;
  leveledUp: boolean;
  evolved: boolean;
  newStage?: string;
}

interface UseChatOptions {
  serverUrl: string;
  context: DramaContext;
  /** Optional user ID for pet integration */
  userId?: string;
  /** Called when pet state updates during chat */
  onPetUpdate?: (update: PetUpdate) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  /** Abort current stream */
  abort: () => void;
}

let msgId = 0;
function genId(): string {
  return `msg_${Date.now()}_${++msgId}`;
}

export function useChatStream({
  serverUrl,
  context,
  userId,
  onPetUpdate,
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync
  messagesRef.current = messages;

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = {
        id: genId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const assistantMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      try {
        const allMessages = [...messagesRef.current, userMsg];
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (userId) {
          headers['x-user-id'] = userId;
        }

        const res = await fetch(`${serverUrl}/api/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ messages: allMessages, context }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No response reader');

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const event = JSON.parse(line.slice(6));

            if (event.type === 'token') {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant') {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + event.data,
                  };
                }
                return updated;
              });
            } else if (event.type === 'pet_update' && onPetUpdate) {
              onPetUpdate(event.data);
            } else if (event.type === 'error') {
              // Update assistant message with error
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === 'assistant') {
                  updated[updated.length - 1] = {
                    ...last,
                    content: `[Error] ${event.data}`,
                  };
                }
                return updated;
              });
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Chat stream error:', err);
          // Show error in UI
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant' && !last.content) {
              updated[updated.length - 1] = {
                ...last,
                content: `[连接失败] ${(err as Error).message}`,
              };
            }
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [serverUrl, context, userId, onPetUpdate]
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, sendMessage, clearMessages, abort };
}
