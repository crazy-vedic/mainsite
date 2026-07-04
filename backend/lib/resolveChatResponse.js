const { detectIntent, detectModifiers, formatFallback } = require('./directAnswer');
const { gatherFacts, suggestSectionLinks } = require('./gatherFacts');
const { buildPolishPrompt } = require('./buildPolishPrompt');
const { buildSystemPrompt } = require('./buildSystemPrompt');
const { streamLLM, streamPolish } = require('./llmClient');

const POLISH_TIMEOUT_MS = 8000;

function normalizeForCompare(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDuplicateOfPrevious(reply, history) {
  const last = [...(history || [])].reverse().find((t) => t.role === 'assistant');
  if (!last?.content || !reply) return false;

  const current = normalizeForCompare(reply);
  const previous = normalizeForCompare(last.content);

  if (!current || !previous) return false;
  if (current === previous) return true;

  const shorter = current.length <= previous.length ? current : previous;
  const longer = current.length <= previous.length ? previous : current;
  const probe = shorter.slice(0, Math.min(100, shorter.length));

  return probe.length >= 40 && longer.includes(probe);
}

const UNIT_SPLIT = /(\s+|[^\s]+)/g;

function streamText(text, onDelta) {
  if (!text || !onDelta) return;

  const units = text.match(UNIT_SPLIT) || [];
  for (const unit of units) {
    onDelta(unit);
  }
}

async function tryPolish(factsBundle, message, history, onDelta, signal) {
  const systemPrompt = buildPolishPrompt(factsBundle, message, history);
  let buffered = '';
  let streamed = false;

  const polishPromise = streamPolish({
    systemPrompt,
    message,
    signal,
    onDelta: (delta) => {
      buffered += delta;
      if (delta && onDelta) {
        streamed = true;
        onDelta(delta);
      }
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

    if (trimmed && isDuplicateOfPrevious(trimmed, history)) {
      if (streamed) return trimmed;
      return null;
    }

    return trimmed || null;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError' || signal?.aborted) throw err;

    const trimmed = buffered.trim();
    if (streamed && trimmed) return trimmed;
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
      links: suggestSectionLinks(null, content),
      source: 'llm',
    };
  }

  const modifiers = detectModifiers(message, history);
  const factsBundle = gatherFacts(message, content, history, intent, modifiers);
  const links = suggestSectionLinks(intent, content);

  let reply = '';
  let source = 'polish';

  const captureDelta = (delta) => {
    reply += delta;
    onDelta(delta);
  };

  const polished = await tryPolish(factsBundle, message, history, captureDelta, signal);

  if (polished) {
    return { reply: polished, links, source };
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
    streamText(fallback, captureDelta);
  }

  return {
    reply: reply.trim(),
    links,
    source,
  };
}

module.exports = { resolveChatResponse, isDuplicateOfPrevious };
