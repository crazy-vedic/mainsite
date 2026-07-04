function truncate(text, max = 100) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function buildSystemPrompt(content, intent = null) {
  const { profile, projects, skills, experience, certifications, contact } = content;
  const name = profile?.name || 'Vedic Varma';

  const include = (section) => !intent || intent === section || intent === 'about';

  const sections = [];

  sections.push(`You answer questions about ${name} using ONLY the facts below. Reply in 1-3 short sentences. Refer to him as "he" or "${name}". If the answer is not in the facts, say "I don't have that information."`);

  if (include('experience')) {
    const experienceLines = (experience || [])
      .slice(0, 6)
      .map((e) => {
        const bullet = e.bullets?.[0] ? truncate(e.bullets[0], 100) : '';
        return bullet
          ? `- ${e.role} @ ${e.company} (${e.start}–${e.end}): ${bullet}`
          : `- ${e.role} @ ${e.company} (${e.start}–${e.end})`;
      })
      .join('\n');
    sections.push(`Experience:\n${experienceLines || 'None.'}`);
  }

  if (include('projects')) {
    const projectLines = (projects || [])
      .slice(0, 5)
      .map((p) => `- ${p.title}: ${truncate(p.description, 70)}`)
      .join('\n');
    sections.push(`Projects:\n${projectLines || 'None.'}`);
  }

  if (include('skills')) {
    const skillLines = (skills || [])
      .map((s) => `${s.category}: ${(s.items || []).slice(0, 6).join(', ')}`)
      .join('\n');
    sections.push(`Skills:\n${skillLines || 'None.'}`);
  }

  if (include('certifications')) {
    const certLine = (certifications || [])
      .slice(0, 5)
      .map((c) => c.title)
      .join('; ');
    sections.push(`Certifications: ${certLine || 'None.'}`);
  }

  if (include('contact')) {
    sections.push(`Email: ${contact?.email || 'not listed'}`);
  }

  return sections.join('\n\n');
}

module.exports = { buildSystemPrompt };
