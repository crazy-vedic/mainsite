import React from 'react';
import resume from './resume.pdf';

function Resume() {
  return (
    <div style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
      <embed 
        src={resume}
        type="application/pdf" 
        style={{width: '100%', height: '100%'}}
      />
    </div>
  );
}

export default Resume;