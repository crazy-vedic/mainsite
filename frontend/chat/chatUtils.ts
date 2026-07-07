import type { Dispatch, SetStateAction } from 'react';
import type { ChatDonePayload, ChatMessage } from '../types/content';

const CHAT_HISTORY_LIMIT = 5;

export function buildChatHistory(messages: ChatMessage[], greeting?: string): ChatMessage[] {
  const turns = messages
    .filter((message) => message.content.trim())
    .map(({ role, content }) => ({ role, content }));

  if (turns.length && turns[0].role === 'assistant' && (!greeting || turns[0].content === greeting)) {
    turns.shift();
  }

  return turns.slice(-CHAT_HISTORY_LIMIT);
}

export function formatRateLimitMessage(seconds: number): string {
  return `Please wait ${seconds} second${seconds === 1 ? '' : 's'} before sending another message.`;
}

export async function parseRateLimitRetryAfter(response: Response): Promise<number> {
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!Number.isNaN(seconds) && seconds > 0) {
      return seconds;
    }
  }

  const reset = response.headers.get('RateLimit-Reset');
  if (reset) {
    const resetValue = parseInt(reset, 10);
    if (!Number.isNaN(resetValue)) {
      const nowSec = Math.floor(Date.now() / 1000);
      const seconds = resetValue > nowSec ? resetValue - nowSec : resetValue;
      if (seconds > 0) {
        return seconds;
      }
    }
  }

  return 60;
}

export function rollbackFailedSend(
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  sentText: string,
): void {
  setMessages((messages) => {
    const next = [...messages];
    const last = next[next.length - 1];

    if (last?.role === 'assistant' && !last.content) {
      next.pop();
    }

    const trailing = next[next.length - 1];
    if (trailing?.role === 'user' && trailing.content === sentText) {
      next.pop();
    }

    return next;
  });
}

type ReadChatStreamOptions = {
  onDelta: (delta: string) => void;
  onDone?: (payload: ChatDonePayload) => void;
  signal?: AbortSignal;
};

export async function readChatStream(
  response: Response,
  { onDelta, onDone, signal }: ReadChatStreamOptions,
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming response body is unavailable.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const line = event.split('\n').find((entry) => entry.startsWith('data: '));
        if (!line) continue;

        const payload = line.slice(6).trim();
        if (!payload) continue;

        let data: {
          error?: string;
          delta?: string;
          done?: boolean;
          reply?: string;
          links?: ChatDonePayload['links'];
          source?: string;
        };

        try {
          data = JSON.parse(payload) as typeof data;
        } catch {
          continue;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.delta) {
          onDelta(data.delta);
        }

        if (data.done) {
          await new Promise<void>((resolve) => queueMicrotask(resolve));
          onDone?.({
            reply: data.reply ?? '',
            links: data.links ?? [],
            source: data.source,
          });
        }
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}
