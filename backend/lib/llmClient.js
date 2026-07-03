/**
 * LLM client — swap or reconfigure here when changing self-hosted models.
 * Default: Ollama-compatible POST /api/chat
 */

async function askLLM({ systemPrompt, history, message }) {
  const baseUrl = (process.env.LLM_API_URL || 'http://localhost:11434').replace(/\/$/, '');
  const model = process.env.LLM_MODEL || 'llama3.1';
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

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      stream: false,
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
