function findMentionedCompany(message, experience) {
  const q = message.toLowerCase();
  return (experience || []).find((e) => {
    const company = e.company.toLowerCase();
    return q.includes(company) || company.split(/[\s,]+/).some((word) => word.length > 3 && q.includes(word));
  });
}

const INTENT_PATTERNS = [
  { intent: 'identity', re: /\b(who are you|what are you)\b/i },
  {
    intent: 'experience',
    re: /\b((work|job|career|professional)[\s-]*(experien[a-z]*|expiri[a-z]*|history|background)|experien[a-z]*|expiri[a-z]*|works?\b|work\s+history|internships?|employ(?:ment|ed)?|where\s+(?:has|did)\s+he\s+work|roles?\s+at)\b/i,
  },
  { intent: 'certifications', re: /\b(certif|gate\s+qualified|ibm\s+data|google\s+cloud)\b/i },
  {
    intent: 'skills',
    re: /\b(skills?|tech\s+stack|technologies|languages|frameworks|what\s+(?:can|does)\s+he\s+know)\b/i,
  },
  { intent: 'contact', re: /\b(contact|email|reach|hire|linkedin|github|whatsapp)\b/i },
  {
    intent: 'projects',
    re: /\b(projects?|built|portfolio|hackathon|what\s+did\s+he\s+(?:build|make|create))\b/i,
  },
  {
    intent: 'about',
    re: /\b(everything|who\s+is\s+vedic|introduce(?:\s+vedic|\s+him)?|about\s+vedic|about\s+him\b|tell\s+me\s+about\s+(?:vedic|him|himself|you)\b)\b/i,
  },
  {
    intent: 'about',
    re: /\btell\s+me\s+about\b/i,
    unless: /\b(work|exper|expiri|job|career|project|skill|certif|contact|role|intern|employ)\b/i,
  },
];

function detectIntent(message, content = {}) {
  const q = message.toLowerCase();

  if (findMentionedCompany(message, content.experience)) return 'experience';

  for (const { intent, re, unless } of INTENT_PATTERNS) {
    if (unless && unless.test(q)) continue;
    if (re.test(q)) return intent;
  }

  return null;
}

function detectModifiers(message, history = []) {
  const q = message.toLowerCase();

  const recent = /\b(recent|latest|current|most recent|last role)\b/.test(q);
  const all = /\b(all|full|complete|entire|whole|resume|timeline|every)\b/.test(q);
  const followUp = /\b(tell me more|go on|what else|expand|more detail|continue|keep going)\b/.test(q);

  return { recent, all, followUp };
}

function introVariant(message, variants) {
  const idx = message.length % variants.length;
  return variants[idx];
}

function formatRoleProse(fact, name, isCurrent = false) {
  const prefix = isCurrent ? "He's currently at" : 'Before that, he was at';
  const highlight = fact.highlight ? ` — ${fact.highlight}` : '';
  return `${prefix} **${fact.company}** as a ${fact.role} (${fact.period})${highlight}`;
}

function formatFallback(intent, tier, content, factsBundle, message = '') {
  const name = content.profile?.name || 'Vedic Varma';
  const { facts = [], followUpOffer } = factsBundle || {};

  switch (intent) {
    case 'identity': {
      const openers = [
        `I'm the AI assistant for ${name}'s portfolio — happy to help you learn about his work.`,
        `Hi! I know ${name}'s projects, experience, and skills. What would you like to explore?`,
      ];
      return introVariant(message, openers);
    }

    case 'about': {
      const profile = facts.find((f) => f.type === 'profile');
      const roles = profile?.roles || 'a developer';
      const roleFacts = facts.filter((f) => f.type === 'role');
      const projectFacts = facts.filter((f) => f.type === 'project');

      const roleText = roleFacts.length
        ? `He's recently worked as ${roleFacts.map((r) => `${r.role} at ${r.company}`).join(' and ')}.`
        : '';
      const projectText = projectFacts.length
        ? `Notable projects include ${projectFacts.map((p) => p.title).join(', ')}.`
        : '';

      const openers = [
        `${name} is ${roles}.`,
        `Here's a quick overview of ${name} — he's ${roles}.`,
      ];
      const body = [introVariant(message, openers), roleText, projectText].filter(Boolean).join(' ');
      const followUp = followUpOffer
        ? ` Would you like to hear about ${followUpOffer}?`
        : ' What would you like to dive into?';
      return body + followUp;
    }

    case 'experience': {
      const roles = facts.filter((f) => f.type === 'role');

      if (tier === 'company' && roles.length === 1) {
        const r = roles[0];
        const highlight = r.highlight ? ` ${r.highlight}` : '';
        return `At **${r.company}**, ${name} worked as a ${r.role} (${r.period}, ${r.location}).${highlight} Want to hear about his other roles?`;
      }

      if (tier === 'recent' && roles.length) {
        const parts = roles.map((r, i) => formatRoleProse(r, name, i === 0));
        const followUp = followUpOffer
          ? ` Want the full timeline, including ${followUpOffer}?`
          : ' Want the full work history?';
        return parts.join(' ') + followUp;
      }

      if (tier === 'all' && roles.length) {
        const openers = [
          `Here's ${name}'s full work history:`,
          `${name} has built experience across several roles:`,
        ];
        const prose = roles.map((r) => {
          const highlight = r.highlight ? ` — ${r.highlight}` : '';
          return `At **${r.company}** (${r.period}), he was a ${r.role}${highlight}.`;
        });
        return `${introVariant(message, openers)} ${prose.join(' ')}`;
      }

      if (roles.length) {
        const summary = roles.slice(0, 3).map((r, i) => formatRoleProse(r, name, i === 0)).join(' ');
        const followUp = followUpOffer
          ? ` I can also tell you about ${followUpOffer}.`
          : ' Want more detail on any of these?';
        return summary + followUp;
      }

      return `I don't have work experience listed for ${name}.`;
    }

    case 'projects': {
      const projects = facts.filter((f) => f.type === 'project');
      if (!projects.length) return `I don't have projects listed for ${name}.`;

      const openers = [
        `${name} has worked on some interesting projects:`,
        `Here are a few highlights from ${name}'s portfolio:`,
      ];
      const prose = projects.map((p) => {
        const stack = p.stack?.length ? ` (${p.stack.join(', ')})` : '';
        return `**${p.title}** — ${p.description}${stack}`;
      });
      return `${introVariant(message, openers)} ${prose.join('. ')}. Want to know about his work experience?`;
    }

    case 'skills': {
      const skills = facts.filter((f) => f.type === 'skill');
      if (!skills.length) return `I don't have skills listed for ${name}.`;

      const grouped = skills.map((s) => `${s.category}: ${(s.items || []).join(', ')}`).join('; ');
      const openers = [
        `${name}'s tech stack spans several areas —`,
        `Here's what ${name} works with:`,
      ];
      return `${introVariant(message, openers)} ${grouped}. Curious about specific projects where he used these?`;
    }

    case 'certifications': {
      const certs = facts.filter((f) => f.type === 'cert');
      if (!certs.length) return `I don't have certifications listed for ${name}.`;

      const list = certs.map((c) => (c.provider ? `${c.title} (${c.provider})` : c.title)).join(', ');
      return `${name} holds certifications including ${list}. Want to know about his skills or projects?`;
    }

    case 'contact': {
      const email = facts.find((f) => f.type === 'email')?.value;
      const socials = facts.filter((f) => f.type === 'social');
      const emailLine = email
        ? `You can reach ${name} at **${email}**`
        : `You can reach ${name} through the contact form on this site`;
      const socialLine = socials.length
        ? ` — he's also on ${socials.map((s) => s.label).join(', ')}.`
        : '.';
      return `${emailLine}${socialLine} Happy to tell you more about his work if you'd like!`;
    }

    default:
      return null;
  }
}

module.exports = {
  findMentionedCompany,
  detectIntent,
  detectModifiers,
  formatFallback,
};
