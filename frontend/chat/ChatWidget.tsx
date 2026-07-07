'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { IconChat, IconClose, IconSend } from '../icons';
import { getClientId } from '../lib/clientId';
import { useAdaptiveStream } from '../lib/streamConsumer';
import { scrollToSection } from '../home/scrollToSection';
import type { ChatConfig, ChatDonePayload, ChatMessage, ChatSectionLink } from '../types/content';
import ChatMessageContent from './ChatMessageContent';
import StreamingMessage from './StreamingMessage';
import {
  buildChatHistory,
  formatRateLimitMessage,
  parseRateLimitRetryAfter,
  readChatStream,
  rollbackFailedSend,
} from './chatUtils';

type ChatSectionLinksProps = {
  links: ChatSectionLink[];
  onNavigate?: () => void;
};

function ChatSectionLinks({ links, onNavigate }: ChatSectionLinksProps) {
  if (!links.length) return null;

  return (
    <nav className="chat-section-links" aria-label="Jump to portfolio sections">
      {links.map((link) => (
        <a
          key={link.intent}
          href={link.href}
          className="chat-section-link"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection(link.href);
            onNavigate?.();
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

type ChatWidgetProps = {
  config?: ChatConfig;
  name?: string;
  variant?: 'inline' | 'floating';
};

export default function ChatWidget({ config, name, variant = 'floating' }: ChatWidgetProps) {
  const enabled = config?.enabled !== false;
  const isInline = variant === 'inline';
  const [open, setOpen] = useState(isInline);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const [, setRateLimitTick] = useState(0);
  const [streamComplete, setStreamComplete] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const {
    enqueue,
    reset: resetStream,
    displayedText,
    displayUnits,
    isStreaming,
    isDraining,
    finish,
    sectionLinks,
    setSectionLinks,
  } = useAdaptiveStream();

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!rateLimitUntil) return undefined;

    const tick = () => {
      if (Date.now() >= rateLimitUntil) {
        setRateLimitUntil(null);
        return;
      }
      setRateLimitTick((value) => value + 1);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [rateLimitUntil]);

  const rateLimitSecondsLeft = rateLimitUntil
    ? Math.max(0, Math.ceil((rateLimitUntil - Date.now()) / 1000))
    : 0;
  const isRateLimited = rateLimitSecondsLeft > 0;

  useEffect(() => {
    if ((isInline || open) && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: config?.greeting || `Hi! Ask me anything about ${name || 'Vedic'}.` },
      ]);
    }
  }, [config?.greeting, isInline, messages.length, name, open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, displayedText]);

  const isStreamActive = sending || isStreaming || isDraining;

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || isRateLimited) return;

    setSendError(null);
    setSectionLinks([]);
    setStreamComplete(false);
    resetStream();

    const history = buildChatHistory(messages, config?.greeting);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((items) => [...items, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setInput('');
    setSending(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const clientId = getClientId();
      if (clientId) {
        headers['X-Client-Id'] = clientId;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        const retryAfter = await parseRateLimitRetryAfter(response);
        setRateLimitUntil(Date.now() + retryAfter * 1000);
        rollbackFailedSend(setMessages, text);
        resetStream();
        setInput(text);
        return;
      }

      if (!response.ok) throw new Error('bad response');

      await readChatStream(response, {
        onDelta: enqueue,
        onDone: ({ reply, links, source }: ChatDonePayload) => {
          console.log('[chat] backend response', { source, reply, links });
          finish(reply, links, (finalReply) => {
            setMessages((items) => {
              const next = [...items];
              next[next.length - 1] = {
                role: 'assistant',
                content: finalReply || "I couldn't find an answer to that.",
              };
              return next;
            });
            setStreamComplete(true);
          });
        },
        signal: controller.signal,
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        resetStream();
        setMessages((items) => {
          const next = [...items];
          const last = next[next.length - 1];
          if (last?.role === 'assistant' && !last.content) {
            next.pop();
          }
          return next;
        });
        return;
      }

      resetStream();
      rollbackFailedSend(setMessages, text);
      setInput(text);
      const message = err instanceof Error ? err.message : '';
      setSendError(
        message && message !== 'bad response'
          ? message
          : "I'm having trouble connecting right now - try again in a moment.",
      );
    } finally {
      setSending(false);
    }
  }, [
    config?.greeting,
    enqueue,
    finish,
    input,
    isRateLimited,
    messages,
    resetStream,
    sending,
    setSectionLinks,
  ]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
    if (event.key === 'Escape' && !isInline) setOpen(false);
  };

  if (!enabled) return null;

  const lastIndex = messages.length - 1;
  const showTyping =
    isStreamActive &&
    messages[lastIndex]?.role === 'assistant' &&
    !messages[lastIndex]?.content &&
    !displayedText;

  const panel = (
    <div className={`chat-panel ${isInline ? 'chat-panel--inline' : ''}`} role="dialog" aria-label={config?.title || 'Chat'}>
      <div className="chat-panel__header">
        <span>{config?.title || `Ask about ${name || 'me'}`}</span>
        {!isInline && (
          <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
            <IconClose />
          </button>
        )}
      </div>

      <div className="chat-panel__messages" ref={listRef}>
        {messages.map((message, index) => {
          const isLastAssistant = index === lastIndex && message.role === 'assistant';
          const showStreamingBubble = isLastAssistant && isStreamActive && (displayedText || !showTyping);

          if (showStreamingBubble) {
            return (
              <div
                key={index}
                className="chat-bubble chat-bubble--assistant chat-bubble--streaming"
                aria-live="polite"
              >
                <StreamingMessage
                  content={message.content}
                  displayUnits={displayUnits}
                  isComplete={streamComplete && !isDraining}
                />
              </div>
            );
          }

          if (isStreamActive && isLastAssistant && !message.content) {
            return null;
          }

          return (
            <div key={index} className={`chat-bubble chat-bubble--${message.role}`}>
              <ChatMessageContent role={message.role} content={message.content} />
            </div>
          );
        })}

        {showTyping && (
          <div className="chat-bubble chat-bubble--assistant chat-bubble--typing" aria-live="polite">
            <span />
            <span />
            <span />
          </div>
        )}

        {sectionLinks.length > 0 && !isStreamActive && (
          <ChatSectionLinks links={sectionLinks} onNavigate={!isInline ? () => setOpen(false) : undefined} />
        )}
      </div>

      {(sendError || isRateLimited) && (
        <p className="chat-panel__error" role="alert" aria-live="polite">
          {isRateLimited ? formatRateLimitMessage(rateLimitSecondsLeft) : sendError}
        </p>
      )}

      <div className="chat-panel__input">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={config?.placeholder || 'Ask something…'}
          rows={1}
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={sending || isRateLimited || !input.trim()}
          aria-label="Send message"
        >
          <IconSend />
        </button>
      </div>
    </div>
  );

  if (isInline) {
    return <div className="chat-widget chat-widget--inline">{panel}</div>;
  }

  return (
    <div className={`chat-widget ${open ? 'chat-widget--open' : ''}`}>
      {open && panel}
      <button
        type="button"
        className="chat-widget__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <IconClose /> : <IconChat />}
      </button>
    </div>
  );
}
