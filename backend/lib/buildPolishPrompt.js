function buildPolishPrompt(factsBundle, userQuestion) {
  const { intent, tier, facts, followUpOffer, name } = factsBundle;

  const factsJson = JSON.stringify({ intent, tier, facts, followUpOffer }, null, 2);

  return `You are ${name}'s portfolio assistant. Rewrite the FACTS into a natural, conversational reply (2–4 sentences).

Rules:
- Use ONLY the facts provided; do not invent details.
- Refer to ${name} in third person ("he", "${name}").
- Do not use bullet lists or markdown headers — write flowing prose.
- You may use **bold** for company names or project titles.
- End with a brief follow-up question when followUpOffer is present (e.g. offer to expand on followUpOffer).
- Keep the reply concise and friendly.

FACTS:
${factsJson}

User question: ${userQuestion}`;
}

module.exports = { buildPolishPrompt };
