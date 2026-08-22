'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import {
  PROMPT_PATH,
  PROMPT_USER,
  WINDOW_TITLE,
  bootLines,
  completeInput,
  formatCompletionListing,
  runCommand,
  type ConsoleContent,
  type OutputLine,
  type OutputSegment,
} from './commands';
import './console.css';

type HistoryEntry = {
  id: string;
  command?: string;
  lines: OutputLine[];
};

type ConsoleProps = ConsoleContent;

function Prompt() {
  return (
    <span className="console-prompt">
      <span className="console-prompt__user">{PROMPT_USER}</span>
      <span className="console-prompt__path">{PROMPT_PATH}</span>
      <span className="console-prompt__dollar">$</span>
      {' '}
    </span>
  );
}

function SegmentView({ segment }: { segment: OutputSegment }) {
  if (segment.kind === 'text') {
    return <>{segment.text}</>;
  }

  const external = /^(https?:|mailto:)/i.test(segment.href);
  if (!external) {
    return (
      <Link href={segment.href} className="console-link">
        {segment.label}
      </Link>
    );
  }

  const isHttp = /^https?:/i.test(segment.href);
  return (
    <a
      href={segment.href}
      className="console-link"
      {...(isHttp ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {segment.label}
    </a>
  );
}

export default function Console(content: ConsoleProps) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState('');
  const [entries, setEntries] = useState<HistoryEntry[]>(() => [
    { id: 'boot', lines: bootLines() },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const historyIndex = useRef(-1);
  const draftRef = useRef('');
  const startedAtRef = useRef(Date.now());

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (!coarse) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const nav = document.querySelector('.site-nav');
    const html = document.documentElement;
    const { body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    const syncFrame = () => {
      const navBottom = nav?.getBoundingClientRect().bottom ?? 0;
      const viewport = window.visualViewport;
      const viewTop = viewport?.offsetTop ?? 0;
      const viewHeight = viewport?.height ?? window.innerHeight;
      const topGap = Math.max(0, navBottom - viewTop);
      const height = Math.max(180, Math.round(viewHeight - topGap));
      page.style.height = `${height}px`;
      page.classList.toggle('console-page--compact', height < 440);
    };

    syncFrame();
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', syncFrame);
    viewport?.addEventListener('scroll', syncFrame);
    window.addEventListener('resize', syncFrame);
    window.addEventListener('orientationchange', syncFrame);

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      page.style.height = '';
      viewport?.removeEventListener('resize', syncFrame);
      viewport?.removeEventListener('scroll', syncFrame);
      window.removeEventListener('resize', syncFrame);
      window.removeEventListener('orientationchange', syncFrame);
    };
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [entries, value]);

  const execute = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const nextHistory = trimmed ? [...commandHistory, trimmed] : commandHistory;
      if (trimmed) {
        setCommandHistory(nextHistory);
      }
      historyIndex.current = -1;
      draftRef.current = '';

      const action = runCommand(raw, content, {
        history: nextHistory,
        startedAt: startedAtRef.current,
      });
      if (action.type === 'clear') {
        setEntries([]);
        setValue('');
        return;
      }
      if (action.type === 'navigate') {
        setEntries((prev) => [
          ...prev,
          { id: `${Date.now()}-${prev.length}`, command: raw, lines: [] },
        ]);
        setValue('');
        router.push(action.href);
        return;
      }
      if (action.type === 'open-url') {
        setEntries((prev) => [
          ...prev,
          { id: `${Date.now()}-${prev.length}`, command: raw, lines: action.lines },
        ]);
        setValue('');
        if (/^(mailto:|tel:)/i.test(action.href)) {
          window.location.href = action.href;
        } else {
          window.open(action.href, '_blank', 'noopener,noreferrer');
        }
        return;
      }
      setEntries((prev) => [
        ...prev,
        { id: `${Date.now()}-${prev.length}`, command: raw, lines: action.lines },
      ]);
      setValue('');
    },
    [content, router, commandHistory],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    execute(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'l' && event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      setEntries([]);
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const result = completeInput(value, content);
      if (result.value !== value) {
        setValue(result.value);
      }
      if (result.listings?.length) {
        const listings = formatCompletionListing(result.listings);
        setEntries((prev) => [
          ...prev,
          {
            id: `tab-${Date.now()}-${prev.length}`,
            command: result.value,
            lines: listings,
          },
        ]);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (commandHistory.length === 0) return;
      if (historyIndex.current === -1) {
        draftRef.current = value;
        historyIndex.current = commandHistory.length - 1;
      } else if (historyIndex.current > 0) {
        historyIndex.current -= 1;
      }
      setValue(commandHistory[historyIndex.current] ?? '');
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex.current === -1) return;
      if (historyIndex.current < commandHistory.length - 1) {
        historyIndex.current += 1;
        setValue(commandHistory[historyIndex.current] ?? '');
      } else {
        historyIndex.current = -1;
        setValue(draftRef.current);
      }
    }
  };

  const onWindowClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('a')) return;
    focusInput();
  };

  return (
    <div className="console-page" ref={pageRef}>
      <p className="console-page__eyebrow">{'// console'}</p>
      <h1 className="console-page__sr-only">Console — Vedic Varma</h1>
      <section className="console-window" aria-label="Interactive terminal" onClick={onWindowClick}>
        <header className="console-chrome">
          <div className="console-chrome__dots" aria-hidden="true">
            <span className="console-chrome__dot console-chrome__dot--close" />
            <span className="console-chrome__dot console-chrome__dot--min" />
            <span className="console-chrome__dot console-chrome__dot--max" />
          </div>
          <div className="console-chrome__title">{WINDOW_TITLE}</div>
        </header>
        <div className="console-body" ref={scrollRef} role="log" aria-live="polite">
          {entries.map((entry) => (
            <div key={entry.id} className="console-entry">
              {entry.command != null && (
                <div className="console-line console-line--cmd">
                  <Prompt />
                  <span className="console-typed">{entry.command}</span>
                </div>
              )}
              {entry.lines.map((line, index) => (
                <div key={`${entry.id}-${index}`} className="console-line console-line--out">
                  {line.map((segment, segmentIndex) => (
                    <SegmentView key={`${entry.id}-${index}-${segmentIndex}`} segment={segment} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <form className="console-input-row" onSubmit={onSubmit}>
          <label htmlFor={inputId} className="console-page__sr-only">
            terminal command
          </label>
          <Prompt />
          <input
            id={inputId}
            ref={inputRef}
            className="console-input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            aria-label="terminal command"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            inputMode="text"
          />
        </form>
      </section>
    </div>
  );
}
