'use client';

import { useEffect, useRef } from 'react';

export default function ScrollScene() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const docHeight = () =>
      Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - window.innerHeight;

    const scrollY = () =>
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const update = () => {
      const element = sceneRef.current;
      if (!element) {
        ticking.current = false;
        return;
      }

      const y = scrollY();
      const max = docHeight();
      const progress = max > 0 ? y / max : 0;
      element.style.setProperty('--scroll', progress.toFixed(4));
      element.style.setProperty('--scroll-px', `${y.toFixed(0)}px`);
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

  return (
    <div className="scroll-scene" ref={sceneRef} aria-hidden="true">
      <div className="scroll-scene__stage">
        <div className="scroll-scene__plane scroll-scene__plane--grid" />
        <svg className="scroll-scene__plane scroll-scene__plane--ring" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="150" />
          <circle cx="200" cy="200" r="110" />
        </svg>
        <svg className="scroll-scene__plane scroll-scene__plane--tri" viewBox="0 0 200 200">
          <polygon points="100,10 190,180 10,180" />
        </svg>
        <svg className="scroll-scene__plane scroll-scene__plane--dots" viewBox="0 0 400 400">
          {Array.from({ length: 24 }).map((_, index) => (
            <circle key={index} cx={20 + (index % 6) * 70} cy={20 + Math.floor(index / 6) * 70} r="2.4" />
          ))}
        </svg>
      </div>
    </div>
  );
}
