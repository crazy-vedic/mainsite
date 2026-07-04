const { findMentionedCompany } = require('./directAnswer');

function truncateBullet(text, max = 120) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function experienceToFact(entry) {
  return {
    role: entry.role,
    company: entry.company,
    period: `${entry.start}–${entry.end}`,
    location: entry.location || 'remote',
    highlight: truncateBullet(entry.bullets?.[0] || ''),
  };
}

function projectToFact(project) {
  return {
    title: project.title,
    description: truncateBullet(project.description, 100),
    stack: (project.stack || []).slice(0, 4),
  };
}

function pickExperienceSlice(experience, tier, message, history) {
  const list = experience || [];

  const mentioned = findMentionedCompany(message, list);
  if (mentioned) {
    return { slice: [mentioned], tier: 'company', company: mentioned.company };
  }

  if (tier === 'recent') {
    return { slice: list.slice(0, 2), tier: 'recent' };
  }

  if (tier === 'all') {
    return { slice: list, tier: 'all' };
  }

  if (tier === 'followUp' && history?.length) {
    const lastAssistant = [...history].reverse().find((t) => t.role === 'assistant');
    if (lastAssistant?.content) {
      const expanded = list.find((e) =>
        lastAssistant.content.toLowerCase().includes(e.company.toLowerCase()),
      );
      if (expanded) {
        return { slice: [expanded], tier: 'company', company: expanded.company };
      }
    }
  }

  return { slice: list.slice(0, 3), tier: 'default' };
}

function pickProjectsSlice(projects, tier) {
  const list = projects || [];
  if (tier === 'recent' || tier === 'top') {
    return { slice: list.slice(0, 3), tier: 'recent' };
  }
  return { slice: list.slice(0, 5), tier: 'default' };
}

function buildFollowUpOffer(intent, tier, content, facts) {
  const experience = content.experience || [];

  if (intent === 'experience' && tier === 'recent' && experience.length > 2) {
    const others = experience.slice(2, 4).map((e) => e.company);
    if (others.length) return `earlier roles at ${others.join(' and ')}`;
  }

  if (intent === 'experience' && tier === 'default' && experience.length > 3) {
    return 'the full work history';
  }

  if (intent === 'about') {
    return 'his recent work, projects, or skills';
  }

  if (intent === 'projects' && (content.projects || []).length > (facts?.length || 0)) {
    return 'more project details';
  }

  return null;
}

function gatherFacts(message, content, history, intent, modifiers = {}) {
  const name = content.profile?.name || 'Vedic Varma';
  let tier = 'default';
  let facts = [];
  let followUpOffer = null;

  switch (intent) {
    case 'identity':
      facts = [{ type: 'identity', text: `AI assistant for ${name}'s portfolio` }];
      break;

    case 'about': {
      const roles = (content.profile?.roles || [])
        .filter((r) => !/^hi$/i.test(r) && !/^i'?m/i.test(r))
        .join(', ');
      facts = [
        { type: 'profile', name, roles: roles || 'developer' },
        ...(content.experience || []).slice(0, 2).map((e) => ({ type: 'role', ...experienceToFact(e) })),
        ...(content.projects || []).slice(0, 2).map((p) => ({ type: 'project', ...projectToFact(p) })),
      ];
      followUpOffer = buildFollowUpOffer(intent, tier, content, facts);
      break;
    }

    case 'experience': {
      if (modifiers.all) tier = 'all';
      else if (modifiers.recent) tier = 'recent';
      else if (modifiers.followUp) tier = 'followUp';

      const picked = pickExperienceSlice(content.experience, tier, message, history);
      tier = picked.tier;
      facts = picked.slice.map((e) => ({ type: 'role', ...experienceToFact(e) }));
      followUpOffer = buildFollowUpOffer(intent, tier, content, facts);
      break;
    }

    case 'projects': {
      if (modifiers.recent) tier = 'recent';
      const picked = pickProjectsSlice(content.projects, tier);
      tier = picked.tier;
      facts = picked.slice.map((p) => ({ type: 'project', ...projectToFact(p) }));
      followUpOffer = buildFollowUpOffer(intent, tier, content, facts);
      break;
    }

    case 'skills': {
      facts = (content.skills || []).map((s) => ({
        type: 'skill',
        category: s.category,
        items: (s.items || []).slice(0, 8),
      }));
      break;
    }

    case 'certifications': {
      facts = (content.certifications || []).map((c) => ({
        type: 'cert',
        title: c.title,
        provider: c.provider || '',
      }));
      break;
    }

    case 'contact': {
      facts = [
        { type: 'email', value: content.contact?.email || '' },
        ...(content.contact?.socials || [])
          .filter((s) => s?.url)
          .map((s) => ({ type: 'social', label: s.label || s.platform, url: s.url })),
      ];
      break;
    }

    default:
      break;
  }

  return { intent, tier, facts, followUpOffer, name };
}

function suggestSectionLinks(intent, content) {
  const SECTIONS = {
    experience: { label: 'Experience', href: '#experience' },
    projects: { label: 'Projects', href: '#projects' },
    skills: { label: 'Skills', href: '#skills' },
    certifications: { label: 'Certifications', href: '#certifications' },
    contact: { label: 'Contact', href: '#contact' },
  };

  const available = [];
  if (content.experience?.length) available.push('experience');
  if (content.projects?.length) available.push('projects');
  if (content.skills?.length) available.push('skills');
  if (content.certifications?.length) available.push('certifications');
  if (content.contact) available.push('contact');

  const relatedByIntent = {
    about: ['experience', 'projects', 'skills'],
    experience: ['experience', 'projects', 'skills'],
    projects: ['projects', 'experience', 'skills'],
    skills: ['skills', 'projects', 'experience'],
    certifications: ['certifications', 'skills', 'experience'],
    contact: ['contact', 'projects', 'experience'],
    identity: ['experience', 'projects', 'skills'],
  };

  const preferred = relatedByIntent[intent] || ['projects', 'experience', 'skills'];

  const seen = new Set();
  return preferred
    .filter((key) => available.includes(key) && !seen.has(key) && seen.add(key))
    .slice(0, 4)
    .map((key) => ({ intent: key, ...SECTIONS[key] }));
}

module.exports = {
  truncateBullet,
  pickExperienceSlice,
  pickProjectsSlice,
  gatherFacts,
  suggestSectionLinks,
};
