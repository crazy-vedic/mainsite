import React from 'react';

function Resume() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = '/resume.pdf';
    return null;
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <iframe
        src="/resume.pdf"
        title="Resume PDF"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}

export default Resume;
