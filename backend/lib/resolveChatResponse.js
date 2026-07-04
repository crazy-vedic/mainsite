const { detectIntent, detectModifiers, formatFallback } = require('./directAnswer');
const { gatherFacts, suggestSectionLinks } = require('./gatherFacts');
const { buildPolishPrompt } = require('./buildPolishPrompt');
const { buildSystemPrompt } = require('./buildSystemPrompt');
const { streamLLM, streamPolish } = require('./llmClient');

const POLISH_TIMEOUT_MS = 45000;

function normalizeForCompare(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getLastTurnPair(history) {
  const turns = history || [];
  let lastAssistant = null;
  let precedingUser = null;

  for (let i = turns.length - 1; i >= 0; i -= 1) {
    if (!lastAssistant && turns[i].role === 'assistant') {
      lastAssistant = turns[i];
      continue;
    }
    if (lastAssistant && turns[i].role === 'user') {
      precedingUser = turns[i];
      break;
    }
  }

  return { lastAssistant, precedingUser };
}

function normalizeQuestion(text) {
  return normalizeForCompare(text)
    .replace(/\b(vedic|varma|bro|please|tell me|about|his|her)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function questionsAreSimilar(current, previous) {
  const a = normalizeQuestion(current);
  const b = normalizeQuestion(previous);
  if (!a || !b) return false;
  if (a === b) return true;

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return shorter.length >= 8 && longer.includes(shorter);
}

function replySimilarity(current, previous) {
  const a = normalizeForCompare(current);
  const b = normalizeForCompare(previous);
  if (!a || !b) return 0;
  if (a === b) return 1;

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;

  if (shorter.length >= 40 && longer.includes(shorter)) {
    return shorter.length / longer.length;
  }

  const wordsA = new Set(a.split(' ').filter((w) => w.length > 3));
  const wordsB = new Set(b.split(' ').filter((w) => w.length > 3));
  if (!wordsA.size || !wordsB.size) return 0;

  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) overlap += 1;
  }

  return overlap / Math.max(wordsA.size, wordsB.size);
}

function isDuplicateOfPrevious(reply, message, history, content) {
  const { lastAssistant, precedingUser } = getLastTurnPair(history);
  if (!lastAssistant?.content || !reply) {
    return { duplicate: false, reason: 'no_previous_reply' };
  }

  const previousReply = lastAssistant.content;
  const previousUserMessage = precedingUser?.content || '';

  if (normalizeForCompare(reply) === normalizeForCompare(previousReply)) {
    return {
      duplicate: true,
      reason: 'exact_match',
      currentUserMessage: message,
      previousUserMessage,
      currentReplyPreview: reply.slice(0, 160),
      previousReplyPreview: previousReply.slice(0, 160),
    };
  }

  const currentIntent = detectIntent(message, content);
  const previousIntent = detectIntent(previousUserMessage, content);
  const reasked = questionsAreSimilar(message, previousUserMessage);
  const sameIntent = Boolean(currentIntent && previousIntent && currentIntent === previousIntent);

  if (!reasked && !sameIntent) {
    return {
      duplicate: false,
      reason: 'different_topic',
      currentIntent,
      previousIntent,
      currentUserMessage: message,
      previousUserMessage,
    };
  }

  const similarity = replySimilarity(reply, previousReply);
  if (similarity >= 0.72) {
    return {
      duplicate: true,
      reason: 'high_similarity',
      similarity: Number(similarity.toFixed(3)),
      reasked,
      sameIntent,
      currentIntent,
      previousIntent,
      currentUserMessage: message,
      previousUserMessage,
      currentReplyPreview: reply.slice(0, 160),
      previousReplyPreview: previousReply.slice(0, 160),
    };
  }

  return {
    duplicate: false,
    reason: 'similar_question_different_answer',
    similarity: Number(similarity.toFixed(3)),
    reasked,
    sameIntent,
    currentIntent,
    previousIntent,
  };
}

const GENERIC_REPLY_RE =
  /^(hi|hello|hey)\b[!.,\s]*(how can i (assist|help)|what can i do|how may i help)/i;

function factNeedles(fact) {
  const needles = [];
  if (fact.title) needles.push(fact.title);
  if (fact.company) needles.push(fact.company);
  if (fact.category) needles.push(fact.category);
  if (fact.role) needles.push(fact.role);
  if (fact.name) needles.push(fact.name);
  if (fact.text) needles.push(fact.text);
  if (fact.value) needles.push(fact.value);
  if (fact.label) needles.push(fact.label);
  if (Array.isArray(fact.items)) {
    needles.push(...fact.items.slice(0, 3));
  }
  if (Array.isArray(fact.stack)) {
    needles.push(...fact.stack.slice(0, 2));
  }
  return needles;
}

function replyReferencesFacts(reply, facts) {
  const lower = reply.toLowerCase();
  return facts.some((fact) =>
    factNeedles(fact).some((needle) => {
      const text = String(needle).toLowerCase();
      const words = text.split(/\s+/).filter((word) => word.length >= 4);
      if (words.length) {
        return words.some((word) => lower.includes(word));
      }
      return text.length >= 4 && lower.includes(text);
    }),
  );
}

function isWeakPolishReply(reply, factsBundle) {
  const trimmed = (reply || '').trim();
  if (!trimmed) return true;
  if (GENERIC_REPLY_RE.test(trimmed)) return true;
  if (/how can i (assist|help) you today/i.test(trimmed)) return true;

  const facts = factsBundle?.facts || [];
  if (!facts.length) return false;

  return !replyReferencesFacts(trimmed, facts);
}

function streamText(text, onDelta) {
  if (text && onDelta) onDelta(text);
}

async function tryPolish(factsBundle, message, history, onDelta, signal) {
  const { systemPrompt, userMessage } = buildPolishPrompt(factsBundle, message, history);
  let buffered = '';

  const polishPromise = streamPolish({
    systemPrompt,
    userMessage,
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

    if (!trimmed) {
      console.log('[polish] rejected: empty response');
      return null;
    }

    const duplicateCheck = isDuplicateOfPrevious(trimmed, message, history, content);
    if (duplicateCheck.duplicate) {
      console.log('[polish] rejected: duplicate of previous reply', duplicateCheck);
      return null;
    }

    if (isWeakPolishReply(trimmed, factsBundle)) {
      console.log('[polish] rejected: generic or missing facts', { reply: trimmed.slice(0, 120) });
      return null;
    }

    console.log('[polish] accepted', { intent: factsBundle.intent, reply: trimmed.slice(0, 120) });
    if (onDelta) streamText(trimmed, onDelta);
    return trimmed;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError' || signal?.aborted) throw err;

    console.log('[polish] rejected:', err.message);
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
      links: [],
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

  console.log('[chat] polish unavailable, using fallback', { intent: factsBundle.intent });
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
