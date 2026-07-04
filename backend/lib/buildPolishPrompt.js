const INTENT_FOCUS = {
  about: 'Give a brief overall introduction — roles, recent work, and notable projects.',
  experience: 'Focus ONLY on work experience and roles. Do NOT repeat a general bio or project list.',
  projects: 'Focus ONLY on projects. Do NOT repeat a general bio or work history summary.',
  skills: 'Focus ONLY on skills and technologies.',
  certifications: 'Focus ONLY on certifications.',
  contact: 'Focus ONLY on how to reach him.',
  identity: 'Briefly explain you are his portfolio assistant.',
};

function buildPolishPrompt(factsBundle, userQuestion, history = []) {
  const { intent, tier, facts, followUpOffer, name } = factsBundle;

  const factsJson = JSON.stringify({ intent, tier, facts, followUpOffer }, null, 2);
  const focus = INTENT_FOCUS[intent] || 'Answer the question using only the facts provided.';

  const lastAssistant = [...history].reverse().find((t) => t.role === 'assistant');
  const antiRepeat = lastAssistant?.content
    ? `\nDo NOT repeat or paraphrase this previous reply: "${lastAssistant.content.slice(0, 200)}${lastAssistant.content.length > 200 ? '…' : ''}"`
    : '';

  const systemPrompt = `You are ${name}'s portfolio assistant. Rewrite the user's FACTS into a natural, conversational reply (2–4 sentences).

Topic: ${intent} — ${focus}

Rules:
- Answer the user's question directly using ONLY the provided facts.
- Do NOT repeat the portfolio greeting ("I'm an AI assistant...").
- Refer to ${name} in third person ("he", "${name}").
- Do not use bullet lists or markdown headers — write flowing prose.
- You may use **bold** for company names or project titles.
- End with a brief follow-up question when followUpOffer is present.
- Keep the reply concise.${antiRepeat ? `\n${antiRepeat}` : ''}`;

  const userMessage = `FACTS:
${factsJson}

User question: ${userQuestion}

Write the reply now. Use specific names and details from the facts above.

[ref:${Date.now()}]`;

  return { systemPrompt, userMessage };
}

module.exports = { buildPolishPrompt };
