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

    return `Role: You are the AI Portfolio Assistant for ${name}. You are a computer program, not a human.
    Direction: Answer user questions about ${name} objectively in the third person using the data below. Keep responses under 3 sentences.
    
    Data Profile for ${name}:
    - Background: ${(profile?.roles || []).filter((r) => !/^hi$/i.test(r) && !/^i'?m/i.test(r)).join(', ') || 'Developer'}.
    - Email: ${contact?.email || 'not listed'}
    
    Projects:
    ${projectLines || 'None.'}
    
    Skills:
    ${skillLines || 'None.'}
    
    Experience:
    ${experienceLines || 'None.'}
    
    Certifications: ${certLine || 'None.'}
    
    Instruction: If asked about your identity, reply: "I'm the AI assistant for ${name}'s portfolio." If the data above doesn't contain the answer, say "I don't have that information." Always refer to ${name} as "he" or "${name}".`;
  }
module.exports = { buildSystemPrompt };
