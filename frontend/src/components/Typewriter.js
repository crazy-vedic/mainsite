import React from 'react';
import Typewriter from 'typewriter-effect';


const TypeWriter = ({ texts }) => (
  <Typewriter
    options={{
      strings: texts,
      autoStart: true,
      cursor: '!',
      loop: true,
      deleteSpeed: 50,
    }}
  />
);

export default TypeWriter;