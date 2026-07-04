const { detectIntent, detectModifiers, formatFallback } = require('./directAnswer');
const { gatherFacts, suggestChips } = require('./gatherFacts');
const { buildPolishPrompt } = require('./buildPolishPrompt');
const { buildSystemPrompt } = require('./buildSystemPrompt');
const { streamLLM, streamPolish } = require('./llmClient');

const POLISH_TIMEOUT_MS = 8000;

function streamText(text, onDelta) {
  if (text && onDelta) onDelta(text);
}

async function tryPolish(factsBundle, message, onDelta, signal) {
  const systemPrompt = buildPolishPrompt(factsBundle, message);
  let buffered = '';

  const polishPromise = streamPolish({
    systemPrompt,
    message,
    signal,
    onDelta: (delta) => {
      buffered += delta;
    },
  });

  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Polish timeout')), POLISH_TIMEOUT_MS);
  });

  try {
    await Promise.race([polishPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    const trimmed = buffered.trim();
    if (trimmed && onDelta) onDelta(trimmed);
    return trimmed || null;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError' || signal?.aborted) throw err;
    return null;
  }
}

async function resolveChatResponse({ message, content, history, signal, onDelta }) {
  const intent = detectIntent(message, content);

  if (!intent) {
    const systemPrompt = buildSystemPrompt(content, null);
    let reply = '';

    await streamLLM({
      systemPrompt,
      history: (history || []).slice(-2),
      message,
      signal,
      onDelta: (delta) => {
        reply += delta;
        onDelta(delta);
      },
    });

    return {
      reply: reply.trim(),
      suggestions: suggestChips(null, 'default', content),
      source: 'llm',
    };
  }

  const modifiers = detectModifiers(message, history);
  const factsBundle = gatherFacts(message, content, history, intent, modifiers);
  const suggestions = suggestChips(intent, factsBundle.tier, content, factsBundle);

  let reply = '';
  let source = 'polish';

  const captureDelta = (delta) => {
    reply += delta;
    onDelta(delta);
  };

  const polished = await tryPolish(factsBundle, message, captureDelta, signal);

  if (polished) {
    return { reply: polished, suggestions, source };
  }

  reply = '';
  source = 'template';
  const fallback = formatFallback(intent, factsBundle.tier, content, factsBundle, message);

  if (!fallback) {
    source = 'llm';
    const systemPrompt = buildSystemPrompt(content, intent);
    await streamLLM({
      systemPrompt,
      history: (history || []).slice(-2),
      message,
      signal,
      onDelta: captureDelta,
    });
  } else {
    streamText(fallback, onDelta);
    reply = fallback;
  }

  return {
    reply: reply.trim(),
    suggestions,
    source,
  };
}

module.exports = { resolveChatResponse };
