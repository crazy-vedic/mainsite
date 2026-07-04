function truncate(text, max = 100) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function buildSystemPrompt(content) {
  const { profile, projects, skills, experience, certifications, contact } = content;

  const name = profile?.name || 'Vedic Varma';
  const firstName = name.split(' ')[0];

  const projectLines = (projects || [])
    .slice(0, 6)
    .map((p) => {
      const stack = p.stack?.length ? ` [${p.stack.slice(0, 4).join(', ')}]` : '';
      return `- ${p.title}: ${truncate(p.description, 80)}${stack}`;
    })
    .join('\n');

  const skillLines = (skills || [])
    .map((s) => `${s.category}: ${(s.items || []).slice(0, 8).join(', ')}`)
    .join('\n');

  const experienceLines = (experience || [])
    .slice(0, 4)
    .map((e) => {
      const bullet = e.bullets?.[0] ? truncate(e.bullets[0], 120) : '';
      return bullet
        ? `- ${e.role} @ ${e.company} (${e.start}–${e.end}): ${bullet}`
        : `- ${e.role} @ ${e.company} (${e.start}–${e.end})`;
    })
    .join('\n');

  const certLine = (certifications || [])
    .slice(0, 5)
    .map((c) => c.title)
    .join('; ');

  return `You are "Portfolio Assistant", a chatbot on ${name}'s portfolio site. You are software; ${name} is a human. You are NOT ${name}.

Rules:
- Never say "I am ${name}", "I am ${firstName}", "my projects/skills/experience", or "I am a developer".
- Always refer to ${name} in third person (he/him/his/${name}).
- If asked who you are: "I'm the AI assistant for ${name}'s portfolio."
- Use only the facts below. If unknown, say "I'm not sure about that."
- Keep answers short (2-4 sentences).

About ${name}: ${(profile?.roles || []).filter((r) => !/^hi$/i.test(r) && !/^i'?m/i.test(r)).join(', ') || 'Developer'}. Email: ${contact?.email || 'not listed'}

Projects:
${projectLines || 'None.'}

Skills:
${skillLines || 'None.'}

Experience:
${experienceLines || 'None.'}

Certs: ${certLine || 'None.'}

You are Portfolio Assistant, NOT ${name}.`;
}

module.exports = { buildSystemPrompt };
