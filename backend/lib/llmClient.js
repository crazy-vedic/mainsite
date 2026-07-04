/**
 * LLM client — swap or reconfigure here when changing self-hosted models.
 * Default: llama-server OpenAI-compatible POST /v1/chat/completions
 */

function buildMessages({ systemPrompt, history, message }) {
  return [
    { role: 'system', content: systemPrompt },
    ...(history || []).filter((m) => m.role === 'user' || m.role === 'assistant'),
    { role: 'user', content: message },
  ];
}

function getLlmConfig() {
  return {
    baseUrl: (process.env.LLM_API_URL || 'http://localhost:8192').replace(/\/$/, ''),
    model: process.env.LLM_MODEL || 'qwen2.5-0.5b',
    apiKey: process.env.LLM_API_KEY,
  };
}

function buildRequestBody({ model, messages, stream }) {
  return {
    model,
    messages,
    stream,
    temperature: 0.3,
    max_tokens: 200,
    stop: ['<|im_end|>', '<|endoftext|>', 'User:', 'Assistant:'],
  };
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    const err = new Error('Request aborted');
    err.name = 'AbortError';
    throw err;
  }
}

async function parseSseStream(readable, onDelta, signal) {
  const reader = readable.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      throwIfAborted(signal);

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        throwIfAborted(signal);

        const line = event.split('\n').find((entry) => entry.startsWith('data: '));
        if (!line) continue;

        const payload = line.slice(6).trim();
        if (!payload || payload === '[DONE]') continue;

        let data;
        try {
          data = JSON.parse(payload);
        } catch {
          continue;
        }

        const delta = data.choices?.[0]?.delta?.content;
        if (delta) onDelta(delta);
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

async function streamLLM({ systemPrompt, history, message, onDelta, signal }) {
  const { baseUrl, model, apiKey } = getLlmConfig();
  const messages = buildMessages({ systemPrompt, history, message });

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(buildRequestBody({ model, messages, stream: true })),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`LLM request failed (${response.status}): ${detail}`);
  }

  if (!response.body) {
    throw new Error('LLM returned an empty stream');
  }

  await parseSseStream(response.body, onDelta, signal);
}

module.exports = { streamLLM };
