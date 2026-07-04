function findMentionedCompany(message, experience) {
  const q = message.toLowerCase();
  return (experience || []).find((e) => {
    const company = e.company.toLowerCase();
    return q.includes(company) || company.split(/[\s,]+/).some((word) => word.length > 3 && q.includes(word));
  });
}

function detectIntent(message, content = {}) {
  const q = message.toLowerCase();

  if (findMentionedCompany(message, content.experience)) return 'experience';

  if (/\b(who are you|what are you)\b/.test(q)) return 'identity';
  if (/\b(everything|tell me about|who is vedic|introduce|about vedic)\b/.test(q)) return 'about';
  if (/\b(exper|works?|work history|work exp|jobs?|internships?|career|employ|where (has|did) he work)\b/.test(q)) {
    return 'experience';
  }  if (/\b(certif|gate qualified|ibm data|google cloud)\b/.test(q)) return 'certifications';
  if (/\b(skills?|tech stack|technologies|languages|frameworks|what (can|does) he know)\b/.test(q)) {
    return 'skills';
  }
  if (/\b(contact|email|reach|hire|linkedin|github|whatsapp)\b/.test(q)) return 'contact';
  if (/\b(project|built|portfolio|hackathon|what did he (build|make|create))\b/.test(q)) return 'projects';

  return null;
}

function formatExperience(experience, name) {
  if (!experience?.length) return `I don't have work experience listed for ${name}.`;

  const lines = experience.map((e) => {
    const period = `${e.start}–${e.end}`;
    const bullet = e.bullets?.[0] ? ` ${e.bullets[0]}` : '';
    return `- **${e.role}** at ${e.company} (${period}, ${e.location || 'remote'}) —${bullet}`;
  });

  return `${name}'s work experience:\n\n${lines.join('\n')}`;
}

function formatProjects(projects, name) {
  if (!projects?.length) return `I don't have projects listed for ${name}.`;

  const lines = projects.slice(0, 7).map((p) => {
    const stack = p.stack?.length ? ` (${p.stack.slice(0, 4).join(', ')})` : '';
    return `- **${p.title}** — ${p.description}${stack}`;
  });

  return `${name}'s projects:\n\n${lines.join('\n')}`;
}

function formatSkills(skills, name) {
  if (!skills?.length) return `I don't have skills listed for ${name}.`;

  const lines = skills.map((s) => `- **${s.category}:** ${(s.items || []).join(', ')}`);
  return `${name}'s skills:\n\n${lines.join('\n')}`;
}

function formatCertifications(certifications, name) {
  if (!certifications?.length) return `I don't have certifications listed for ${name}.`;

  const lines = certifications.map((c) => `- ${c.title}${c.provider ? ` (${c.provider})` : ''}`);
  return `${name}'s certifications:\n\n${lines.join('\n')}`;
}

function formatContact(contact, name) {
  const email = contact?.email;
  const socials = (contact?.socials || [])
    .filter((s) => s?.url)
    .map((s) => `${s.label}: ${s.url}`)
    .join('\n');

  const parts = [`You can reach ${name} at ${email || 'the contact form on this site'}.`];
  if (socials) parts.push(socials);
  return parts.join('\n');
}

function formatAbout(content) {
  const name = content.profile?.name || 'Vedic Varma';
  const roles = (content.profile?.roles || [])
    .filter((r) => !/^hi$/i.test(r) && !/^i'?m/i.test(r))
    .join(', ');

  const topJobs = (content.experience || []).slice(0, 3).map((e) => `${e.role} at ${e.company}`).join('; ');
  const topProjects = (content.projects || []).slice(0, 3).map((p) => p.title).join(', ');

  return `${name} is ${roles || 'a developer'}. Recent roles: ${topJobs || 'not listed'}. Notable projects: ${topProjects || 'not listed'}. Ask about his experience, projects, skills, or certifications for more detail.`;
}

function formatSingleExperience(entry, name) {
  const bullet = entry.bullets?.[0] || '';
  return `At ${entry.company}, ${name} worked as **${entry.role}** (${entry.start}–${entry.end}, ${entry.location || 'remote'}). ${bullet}`;
}

function tryDirectAnswer(message, content) {
  const intent = detectIntent(message, content);
  if (!intent) return null;

  const name = content.profile?.name || 'Vedic Varma';
  const mentionedCompany = findMentionedCompany(message, content.experience);

  if (mentionedCompany) {
    return formatSingleExperience(mentionedCompany, name);
  }

  switch (intent) {
    case 'identity':
      return `I'm the AI assistant for ${name}'s portfolio.`;
    case 'about':
      return formatAbout(content);
    case 'experience':
      return formatExperience(content.experience, name);
    case 'projects':
      return formatProjects(content.projects, name);
    case 'skills':
      return formatSkills(content.skills, name);
    case 'certifications':
      return formatCertifications(content.certifications, name);
    case 'contact':
      return formatContact(content.contact, name);
    default:
      return null;
  }
}

module.exports = { detectIntent, tryDirectAnswer };
