'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ChatMessageContent from './ChatMessageContent';

type StreamingTextProps = {
  units: string[];
};

function StreamingText({ units }: StreamingTextProps) {
  const prevCountRef = useRef(0);
  const animateFrom = prevCountRef.current;

  useLayoutEffect(() => {
    prevCountRef.current = units.length;
  }, [units.length]);

  return (
    <>
      {units.map((unit, index) => (
        <span key={index} className={index >= animateFrom ? 'chat-word' : undefined}>
          {unit}
        </span>
      ))}
    </>
  );
}

type StreamingMessageProps = {
  content: string;
  displayUnits: string[];
  isComplete: boolean;
};

export default function StreamingMessage({ content, displayUnits, isComplete }: StreamingMessageProps) {
  const [showMarkdown, setShowMarkdown] = useState(false);

  useEffect(() => {
    if (isComplete && content) {
      const id = requestAnimationFrame(() => setShowMarkdown(true));
      return () => cancelAnimationFrame(id);
    }

    setShowMarkdown(false);
    return undefined;
  }, [isComplete, content]);

  if (showMarkdown && isComplete && content) {
    return <ChatMessageContent role="assistant" content={content} />;
  }

  return <StreamingText units={displayUnits} />;
}
