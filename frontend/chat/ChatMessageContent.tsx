'use client';

import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import type { ChatRole } from '../types/content';

type ChatMessageContentProps = {
  role: ChatRole;
  content: string;
};

const markdownComponents: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

export default function ChatMessageContent({ role, content }: ChatMessageContentProps) {
  if (role === 'user') {
    return <>{content}</>;
  }

  return (
    <div className="chat-markdown chat-bubble--settled">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}
