'use client';

import { useEffect, type CSSProperties } from 'react';

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
  overflow: 'hidden',
};

export default function NotFound() {
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  return (
    <div style={containerStyle}>
      <iframe
        src="https://tenor.com/embed/17900619"
        allowFullScreen
        title="Confused John Travolta GIF"
        scrolling="no"
        style={iframeStyle}
      />
    </div>
  );
}
