import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
};

const iframeStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none',
};

function isMobileUserAgent(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Android/i.test(userAgent);
}

export const metadata: Metadata = {
  title: 'Resume | Vedic Varma',
};

export default async function ResumePage() {
  const userAgent = (await headers()).get('user-agent') || '';

  if (isMobileUserAgent(userAgent)) {
    redirect('/resume.pdf');
  }

  return (
    <div style={containerStyle}>
      <iframe src="/resume.pdf" title="Resume PDF" style={iframeStyle} />
    </div>
  );
}
