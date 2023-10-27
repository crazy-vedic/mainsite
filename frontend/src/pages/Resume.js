import React from 'react';
import resume from './resume.pdf'

function Resume() {
  return (
    <div>
      <iframe
        title="Resume"
        src={resume}
        width="100%"
        height="1000"
      ></iframe>
    </div>
  );
}

export default Resume;
