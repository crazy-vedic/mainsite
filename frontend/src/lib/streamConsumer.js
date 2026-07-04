import { useState, useRef, useCallback, useEffect } from 'react';

const WORD_SPLIT = /(\s+)/;

function splitIntoUnits(text) {
  if (!text) return [];
  return text.match(WORD_SPLIT) || [text];
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useAdaptiveStream() {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDraining, setIsDraining] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const queueRef = useRef([]);
  const timerRef = useRef(null);
  const finishRef = useRef(null);
  const finalReplyRef = useRef('');
  const isCompleteRef = useRef(false);
  const flushModeRef = useRef(false);
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
    finishRef.current = null;
    finalReplyRef.current = '';
    isCompleteRef.current = false;
    flushModeRef.current = false;
    setDisplayedText('');
    setIsStreaming(false);
    setIsDraining(false);
    setSuggestions([]);
  }, [clearTimer]);

  const drainTick = useCallback(() => {
    const queue = queueRef.current;

    if (queue.length === 0) {
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

    const backlog = queue.length;
    let batch = backlog > 80 ? 6 : backlog > 40 ? 4 : backlog > 15 ? 2 : 1;

    if (flushModeRef.current) {
      batch = Math.max(batch, Math.ceil(backlog / 10));
    }

    if (reducedMotionRef.current) {
      batch = backlog;
    }

    const units = queue.splice(0, batch);
    setDisplayedText((prev) => prev + units.join(''));

    const delayMs = reducedMotionRef.current
      ? 0
      : Math.max(8, 28 - backlog * 0.25);

    timerRef.current = setTimeout(drainTick, delayMs);
  }, [clearTimer]);

  const startDrain = useCallback(() => {
    if (timerRef.current) return;
    setIsDraining(true);
    drainTick();
  }, [drainTick]);

  const enqueue = useCallback(
    (text) => {
      if (!text) return;
      const units = splitIntoUnits(text);
      queueRef.current.push(...units);
      setIsStreaming(true);
      startDrain();
    },
    [startDrain],
  );

  const finish = useCallback(
    (reply, chipSuggestions = [], onFinish) => {
      finalReplyRef.current = reply || '';
      isCompleteRef.current = true;
      finishRef.current = onFinish || null;

      if (chipSuggestions?.length) {
        setSuggestions(chipSuggestions);
      }

      if (queueRef.current.length > 15) {
        flushModeRef.current = true;
      }

      if (queueRef.current.length === 0) {
        clearTimer();
        setIsDraining(false);
        setIsStreaming(false);
        if (onFinish) onFinish(reply || '');
      } else {
        startDrain();
      }
    },
    [clearTimer, startDrain],
  );

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    enqueue,
    reset,
    displayedText,
    isStreaming,
    isDraining,
    finish,
    suggestions,
    setSuggestions,
  };
}
