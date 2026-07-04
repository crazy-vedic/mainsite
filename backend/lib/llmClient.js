/**
 * LLM client — swap or reconfigure here when changing self-hosted models.
 * Default: Ollama-compatible POST /api/chat
 */

async function askLLM({ systemPrompt, history, message }) {
  const baseUrl = (process.env.LLM_API_URL || 'http://localhost:8192').replace(/\/$/, '');
  const model = process.env.LLM_MODEL || 'qwen2.5-0.5b';
  const apiKey = process.env.LLM_API_KEY;
  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).filter((m) => m.role === 'user' || m.role === 'assistant'),
    { role: 'user', content: message },
  ];

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: 0.3,
      max_tokens: 200, // <-- CRITICAL: Clamp the max length so it physically cannot loop past 150 tokens
      stop: ["<|im_end|>", "<|endoftext|>", "User:", "Assistant:"] // <-- Force kill the generation loop
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`LLM request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const reply = data.message?.content || data.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error('LLM returned an empty response');
  }

  return { reply: reply.trim() };
}

module.exports = { askLLM };
