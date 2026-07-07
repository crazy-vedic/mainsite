'use client';

import { useEffect, useRef, useState } from 'react';
import { IconArrowUp } from '../icons';

export default function ScrollToTop() {
  const [progress, setProgress] = useState<number>(0);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      const start = vh;
      const end = vh * 3;
      const value = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
      setProgress(value);
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const handleClick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      type="button"
      className="scroll-top"
      onClick={handleClick}
      aria-label="Scroll to top"
      title="Scroll to top"
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * 40}px) scale(${0.9 + progress * 0.1})`,
        pointerEvents: progress > 0.05 ? 'auto' : 'none',
      }}
    >
      <IconArrowUp />
    </button>
  );
}
