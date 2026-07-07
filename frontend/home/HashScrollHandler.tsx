'use client';

import { useEffect } from 'react';
import { scrollToSection } from './scrollToSection';

export default function HashScrollHandler() {
  useEffect(() => {
    const scrollIfHash = () => {
      if (window.location.hash) {
        scrollToSection(window.location.hash);
      }
    };

    requestAnimationFrame(scrollIfHash);
    window.addEventListener('hashchange', scrollIfHash);
    return () => window.removeEventListener('hashchange', scrollIfHash);
  }, []);

  return null;
}
