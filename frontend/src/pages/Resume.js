import React from 'react';
import resume from './resume.pdf';

function Resume() {
  return (
    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden'}}>
      <embed 
        src={resume}
        type="application/pdf" 
        style={{width: '100%', height: '100%'}}
      />
    </div>
  );
}

export default Resume;
