import { useState, useRef, useCallback, useEffect } from 'react';

const UNIT_SPLIT = /(\s+|[^\s]+)/g;

function splitUnits(text) {
  if (!text) return [];
  return text.match(UNIT_SPLIT) || [];
}

function takeUnits(text, maxCount) {
  const units = splitUnits(text);
  if (units.length <= maxCount) {
    return { taken: units, remaining: '' };
  }
  return {
    taken: units.slice(0, maxCount),
    remaining: units.slice(maxCount).join(''),
  };
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function estimateBacklog(queue, pending) {
  const pendingUnits = splitUnits(pending).length;
  const queuedChars = queue.reduce((sum, chunk) => sum + chunk.length, 0);
  const pendingChars = pending.length;
  return pendingUnits + Math.ceil(queuedChars / 4) + pendingChars;
}

export function useAdaptiveStream() {
  const [displayedText, setDisplayedText] = useState('');
  const [displayUnits, setDisplayUnits] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDraining, setIsDraining] = useState(false);
  const [sectionLinks, setSectionLinks] = useState([]);

  const queueRef = useRef([]);
  const pendingRef = useRef('');
  const timerRef = useRef(null);
  const finishRef = useRef(null);
  const finalReplyRef = useRef('');
  const isCompleteRef = useRef(false);
  const reducedMotionRef = useRef(prefersReducedMotion());

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    queueRef.current = [];
    pendingRef.current = '';
    finishRef.current = null;
    finalReplyRef.current = '';
    isCompleteRef.current = false;
    setDisplayedText('');
    setDisplayUnits([]);
    setIsStreaming(false);
    setIsDraining(false);
    setSectionLinks([]);
  }, [clearTimer]);

  const scheduleDrain = useCallback(
    (delayMs) => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        drainTickRef.current();
      }, delayMs);
    },
    [clearTimer],
  );

  const drainTickRef = useRef(() => {});

  drainTickRef.current = () => {
    if (!pendingRef.current && queueRef.current.length > 0) {
      pendingRef.current = queueRef.current.shift();
    }

    if (!pendingRef.current && queueRef.current.length === 0) {
      clearTimer();
      setIsDraining(false);

      if (isCompleteRef.current && finishRef.current) {
        const cb = finishRef.current;
        finishRef.current = null;
        setIsStreaming(false);
        cb(finalReplyRef.current);
      }
      return;
    }

    const backlog = estimateBacklog(queueRef.current, pendingRef.current);
    let batch = 1;
    if (backlog > 100) batch = 2;
    if (backlog > 200) batch = 3;

    if (reducedMotionRef.current) {
      while (queueRef.current.length) {
        pendingRef.current += queueRef.current.shift();
      }
      batch = splitUnits(pendingRef.current).length;
    }

    const { taken, remaining } = takeUnits(pendingRef.current, batch);
    pendingRef.current = remaining;

    if (taken.length > 0) {
      const chunk = taken.join('');
      setDisplayUnits((prev) => [...prev, ...taken]);
      setDisplayedText((prev) => prev + chunk);
    }

    if (!pendingRef.current && queueRef.current.length > 0) {
      pendingRef.current = queueRef.current.shift();
    }

    if (!pendingRef.current && queueRef.current.length === 0) {
      clearTimer();
      setIsDraining(false);

      if (isCompleteRef.current && finishRef.current) {
        const cb = finishRef.current;
        finishRef.current = null;
        setIsStreaming(false);
        cb(finalReplyRef.current);
      }
      return;
    }

    const delayMs = reducedMotionRef.current
      ? 0
      : Math.max(16, 32 - backlog * 0.05);

    scheduleDrain(delayMs);
  };

  const startDrain = useCallback(() => {
    if (timerRef.current) return;
    setIsDraining(true);
    drainTickRef.current();
  }, []);

  const enqueue = useCallback(
    (text) => {
      if (!text) return;
      queueRef.current.push(text);
      setIsStreaming(true);
      startDrain();
    },
    [startDrain],
  );

  const finish = useCallback(
    (reply, links = [], onFinish) => {
      finalReplyRef.current = reply || '';
      isCompleteRef.current = true;
      finishRef.current = onFinish || null;

      if (links?.length) {
        setSectionLinks(links);
      } else {
        setSectionLinks([]);
      }

      if (!pendingRef.current && queueRef.current.length === 0 && !timerRef.current) {
        setIsDraining(false);
        setIsStreaming(false);
        if (onFinish) onFinish(reply || '');
      } else {
        startDrain();
      }
    },
    [startDrain],
  );

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    enqueue,
    reset,
    displayedText,
    displayUnits,
    isStreaming,
    isDraining,
    finish,
    sectionLinks,
    setSectionLinks,
  };
};
