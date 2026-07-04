import React, { useEffect } from 'react';

const Error404 = () => {
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
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <iframe
        src="https://tenor.com/embed/17900619"
        allowFullScreen
        title="Confused John Travolta GIF"
        scrolling="no"
        frameBorder="0"
        style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }}
      />
    </div>
  );
};

export default Error404;
