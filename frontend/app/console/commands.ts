import type { Certification, Contact, ExperienceItem, Project, Skill } from '../../types/content';

export type OutputSegment =
  | { kind: 'text'; text: string }
  | { kind: 'link'; href: string; label: string };

export type OutputLine = OutputSegment[];

export type CommandAction =
  | { type: 'print'; lines: OutputLine[] }
  | { type: 'clear' }
  | { type: 'navigate'; href: string }
  | { type: 'open-url'; href: string; lines: OutputLine[] };

export type CommandRuntime = {
  history: string[];
  startedAt: number;
};

export type ConsoleContent = {
  name: string;
  projects: Project[];
  experience: ExperienceItem[];
  skills: Skill[];
  contact: Contact;
  certifications: Certification[];
};

export const PROMPT_USER = 'vedic@varma';
export const PROMPT_PATH = ':~/console$';
export const WINDOW_TITLE = 'vedic@varma: ~/console';

export const COMMAND_NAMES = [
  'help',
  'whoami',
  'who',
  'about',
  'now',
  'stack',
  'ls',
  'cat',
  'projects',
  'project',
  'experience',
  'skills',
  'certs',
  'certifications',
  'contact',
  'mail',
  'email',
  'linkedin',
  'whatsapp',
  'phone',
  'open',
  'site',
  'home',
  'resume',
  'pdf',
  'clear',
  'date',
  'pwd',
  'uname',
  'uptime',
  'history',
  'man',
  'echo',
  'cowsay',
  'fortune',
  'theme',
  'palette',
  'neofetch',
  'github',
  'ask',
  'chat',
  'sudo',
  'exit',
  'back',
  'sl',
  'vim',
  'emacs',
  'nano',
] as const;

const CAT_TARGETS = [
  'projects',
  'experience',
  'skills',
  'contact',
  'resume',
  'certifications',
  'certs',
] as const;

const OPEN_TARGETS = [
  'home',
  'site',
  'projects',
  'experience',
  'skills',
  'contact',
  'certifications',
  'certs',
  'resume',
  'pdf',
] as const;

export function bootLines(): OutputLine[] {
  return [
    textLine('vedicvarma.com/console'),
    textLine('full-stack + infra · CSE @ MUJ · previously Razorpay'),
    textLine(''),
    textLine('type `help` to list commands'),
  ];
}

export function parseInput(raw: string): { name: string; args: string[] } {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { name: '', args: [] };
  }
  return { name: parts[0].toLowerCase(), args: parts.slice(1) };
}

export type TabCompleteResult = {
  value: string;
  listings?: string[];
};

export function completeInput(raw: string, content?: ConsoleContent): TabCompleteResult {
  const endsWithSpace = /\s$/.test(raw);
  const parts = raw.trimStart().split(/\s+/);
  const first = (parts[0] ?? '').toLowerCase();
  const projectIds = content ? content.projects.map(projectId) : [];

  if (!raw.trim() || (parts.length === 1 && !endsWithSpace)) {
    return completeToken(raw, first, COMMAND_NAMES, (match) => match);
  }

  if (first === 'cat') {
    const arg = endsWithSpace && parts.length === 1 ? '' : (parts[1] ?? '').toLowerCase();
    const catCandidates = [...CAT_TARGETS, ...projectIds.map((id) => `projects/${id}`)];
    return completeToken(raw, arg, catCandidates, (match) => `cat ${match}`);
  }

  if (first === 'open') {
    const arg = endsWithSpace && parts.length === 1 ? '' : (parts[1] ?? '').toLowerCase();
    return completeToken(raw, arg, OPEN_TARGETS, (match) => `open ${match}`);
  }

  if (first === 'project' || first === 'ls') {
    const arg = endsWithSpace && parts.length === 1 ? '' : (parts[1] ?? '').toLowerCase();
    const candidates = first === 'ls' ? ['projects', 'certifications', ...CAT_TARGETS] : projectIds;
    return completeToken(raw, arg, candidates, (match) => `${first} ${match}`);
  }

  if (first === 'man') {
    const arg = endsWithSpace && parts.length === 1 ? '' : (parts[1] ?? '').toLowerCase();
    return completeToken(raw, arg, COMMAND_NAMES, (match) => `man ${match}`);
  }

  return { value: raw };
}

function completeToken(
  raw: string,
  prefix: string,
  candidates: readonly string[],
  rebuild: (match: string) => string,
): TabCompleteResult {
  const matches = uniqueMatches(prefix, candidates);
  if (matches.length === 0) {
    return { value: raw };
  }
  if (matches.length === 1) {
    const completed = rebuild(matches[0]);
    return { value: completed.endsWith(' ') ? completed : `${completed} ` };
  }

  const common = longestCommonPrefix(matches);
  const next = rebuild(common);
  if (common.length > prefix.length) {
    return { value: next };
  }
  return { value: raw.startsWith(next) ? raw : next, listings: matches };
}

function uniqueMatches(prefix: string, candidates: readonly string[]): string[] {
  const seen = new Set<string>();
  const matches: string[] = [];
  for (const name of candidates) {
    if (!name.startsWith(prefix) || seen.has(name)) continue;
    seen.add(name);
    matches.push(name);
  }
  return matches.sort();
}

export function formatCompletionListing(matches: string[], width = 72): OutputLine[] {
  if (matches.length === 0) return [];
  const colWidth = Math.max(...matches.map((name) => name.length)) + 2;
  const cols = Math.max(1, Math.floor(width / colWidth));
  const lines: OutputLine[] = [];
  for (let i = 0; i < matches.length; i += cols) {
    const row = matches
      .slice(i, i + cols)
      .map((name) => name.padEnd(colWidth))
      .join('')
      .trimEnd();
    lines.push(textLine(row));
  }
  return lines;
}

function longestCommonPrefix(values: string[]): string {
  if (values.length === 0) return '';
  let prefix = values[0];
  for (const value of values.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < value.length && prefix[i] === value[i]) {
      i += 1;
    }
    prefix = prefix.slice(0, i);
  }
  return prefix;
}

export function runCommand(raw: string, content: ConsoleContent, runtime: CommandRuntime): CommandAction {
  const { name, args } = parseInput(raw);
  if (!name) {
    return { type: 'print', lines: [] };
  }

  switch (name) {
    case 'help':
      return { type: 'print', lines: helpLines() };
    case 'whoami':
    case 'who':
      return { type: 'print', lines: whoamiLines(content.name) };
    case 'about':
      return { type: 'print', lines: aboutLines(content) };
    case 'now':
    case 'stack':
      return { type: 'print', lines: nowLines(content) };
    case 'ls':
      return lsCommand(args, content);
    case 'cat':
      return catCommand(args, content);
    case 'projects':
      return { type: 'print', lines: projectLines(content.projects) };
    case 'project':
      return projectCommand(args, content);
    case 'experience':
      return { type: 'print', lines: experienceLines(content.experience) };
    case 'skills':
      return { type: 'print', lines: skillLines(content.skills) };
    case 'certs':
    case 'certifications':
      return { type: 'print', lines: certLines(content.certifications) };
    case 'contact':
      return { type: 'print', lines: contactLines(content.contact) };
    case 'mail':
    case 'email':
      return contactVerb(content.contact, 'email');
    case 'linkedin':
      return contactVerb(content.contact, 'linkedin');
    case 'whatsapp':
      return contactVerb(content.contact, 'whatsapp');
    case 'phone':
      return contactVerb(content.contact, 'phone');
    case 'open':
      return openCommand(args);
    case 'site':
    case 'home':
    case 'exit':
    case 'back':
      return { type: 'navigate', href: '/' };
    case 'resume':
      if (args.some((arg) => arg === '--pdf' || arg.toLowerCase() === 'pdf')) {
        return { type: 'navigate', href: '/resume.pdf' };
      }
      return { type: 'navigate', href: '/resume' };
    case 'pdf':
      return { type: 'navigate', href: '/resume.pdf' };
    case 'clear':
      return { type: 'clear' };
    case 'date':
      return { type: 'print', lines: [textLine(new Date().toString())] };
    case 'pwd':
      return { type: 'print', lines: [textLine('/home/vedic/console')] };
    case 'uname':
      return { type: 'print', lines: [textLine('vedicOS console 1.0  x86_64')] };
    case 'uptime':
      return { type: 'print', lines: [textLine(formatUptime(runtime.startedAt))] };
    case 'history':
      return { type: 'print', lines: historyLines(runtime.history) };
    case 'man':
      return { type: 'print', lines: manLines(args[0]) };
    case 'echo':
      return { type: 'print', lines: [textLine(echoText(args))] };
    case 'cowsay':
      return { type: 'print', lines: cowsayLines(echoText(args) || fortuneFact(content)) };
    case 'fortune':
      return { type: 'print', lines: [textLine(fortuneFact(content))] };
    case 'theme':
    case 'palette':
      return { type: 'print', lines: themeLines() };
    case 'neofetch':
      return { type: 'print', lines: neofetchLines(content) };
    case 'github':
      return contactVerb(content.contact, 'github');
    case 'ask':
    case 'chat':
      return {
        type: 'print',
        lines: [
          textLine('natural language lives in the hero chat on the homepage.'),
          [{ kind: 'text', text: 'open it: ' }, { kind: 'link', href: '/', label: '/' }],
        ],
      };
    case 'sudo':
      return {
        type: 'print',
        lines: [textLine('vedic is not in the sudoers file. This incident will be reported.')],
      };
    case 'sl':
      return { type: 'print', lines: slLines() };
    case 'vim':
      return {
        type: 'print',
        lines: [textLine("welcome to vim. you can't quit from here — try `exit`.")],
      };
    case 'emacs':
      return { type: 'print', lines: [textLine('emacs is a great OS, lacking only a decent editor.')] };
    case 'nano':
      return { type: 'print', lines: [textLine('nano: caught in 4k. this is a brochure CLI.')] };
    default:
      return {
        type: 'print',
        lines: [textLine(`command not found: ${name}`), textLine('try help')],
      };
  }
}

function lsCommand(args: string[], content: ConsoleContent): CommandAction {
  const target = (args[0] ?? '').replace(/\/$/, '').toLowerCase();
  if (!target) {
    return {
      type: 'print',
      lines: [textLine('projects/  experience/  skills/  certifications/  contact/  resume')],
    };
  }
  if (target === 'projects') {
    const ids = content.projects.map(projectId);
    return {
      type: 'print',
      lines: ids.length ? [textLine(ids.join('  '))] : [textLine('(empty)')],
    };
  }
  if (target === 'certifications' || target === 'certs') {
    return { type: 'print', lines: certLines(content.certifications) };
  }
  return { type: 'print', lines: [textLine(`ls: cannot access '${args[0]}': No such file or directory`)] };
}

function catCommand(args: string[], content: ConsoleContent): CommandAction {
  const target = args.join('/').replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/').toLowerCase();
  if (!target) {
    return {
      type: 'print',
      lines: [textLine('usage: cat [projects|experience|skills|certifications|contact|resume]')],
    };
  }

  const nestedProject = target.startsWith('projects/') ? target.slice('projects/'.length) : '';
  if (nestedProject) {
    return projectCommand([nestedProject], content);
  }

  switch (target) {
    case 'projects':
      return { type: 'print', lines: projectLines(content.projects) };
    case 'experience':
      return { type: 'print', lines: experienceLines(content.experience) };
    case 'skills':
      return { type: 'print', lines: skillLines(content.skills) };
    case 'certs':
    case 'certifications':
      return { type: 'print', lines: certLines(content.certifications) };
    case 'contact':
      return { type: 'print', lines: contactLines(content.contact) };
    case 'resume':
      return {
        type: 'print',
        lines: [
          [
            { kind: 'text', text: 'resume → ' },
            { kind: 'link', href: '/resume', label: '/resume' },
          ],
        ],
      };
    default:
      return { type: 'print', lines: [textLine(`cat: ${args[0]}: No such file or directory`)] };
  }
}

function openCommand(args: string[]): CommandAction {
  const target = (args[0] ?? '').replace(/^\/+|\/+$/g, '').replace(/^#/, '').toLowerCase();
  if (!target || target === 'home' || target === 'site' || target === '.') {
    return { type: 'navigate', href: '/' };
  }

  const sections: Record<string, string> = {
    projects: '/#projects',
    experience: '/#experience',
    skills: '/#skills',
    contact: '/#contact',
    certifications: '/#certifications',
    certs: '/#certifications',
    resume: '/resume',
    pdf: '/resume.pdf',
  };

  const href = sections[target];
  if (!href) {
    return {
      type: 'print',
      lines: [
        textLine(`open: unknown target '${args[0]}'`),
        textLine('usage: open [home|projects|experience|skills|certs|contact|resume|pdf]'),
      ],
    };
  }
  return { type: 'navigate', href };
}

function projectCommand(args: string[], content: ConsoleContent): CommandAction {
  const query = args.join(' ').trim();
  if (!query) {
    return {
      type: 'print',
      lines: [
        textLine('usage: project <id>'),
        textLine(`ids: ${content.projects.map(projectId).join('  ')}`),
      ],
    };
  }

  const match = findProject(content.projects, query);
  if (match.type === 'one') {
    return { type: 'print', lines: projectDetailLines(match.project) };
  }
  if (match.type === 'many') {
    return {
      type: 'print',
      lines: [
        textLine(`project: '${query}' is ambiguous:`),
        ...match.projects.map((project) => textLine(`  ${projectId(project)}  ${project.title}`)),
      ],
    };
  }
  return {
    type: 'print',
    lines: [
      textLine(`project: '${query}' not found`),
      textLine(`ids: ${content.projects.map(projectId).join('  ')}`),
    ],
  };
}

function helpLines(): OutputLine[] {
  const rows: Array<[string, string]> = [
    ['help', 'list available commands'],
    ['whoami', 'name and one-line bio'],
    ['now', 'current role + previously'],
    ['about', 'internships, awards, GATE'],
    ['ls', 'list console paths (try `ls projects`)'],
    ['cat <path>', 'read projects, experience, skills, certs, contact, resume'],
    ['projects', 'project one-liners'],
    ['project <id>', 'one project in detail'],
    ['experience', 'roles and dates'],
    ['skills', 'languages and infra'],
    ['certs', 'certifications and GATE'],
    ['contact', 'email, LinkedIn, GitHub, site'],
    ['mail / linkedin / github', 'print (and open) a contact channel'],
    ['open [section]', 'go to / or /#projects, /#contact, …'],
    ['resume', 'open /resume  (resume --pdf for the file)'],
    ['pdf', 'open /resume.pdf'],
    ['pwd / uname / uptime', 'where / what / how long'],
    ['history', 'commands from this session'],
    ['man <cmd>', 'one-line manual'],
    ['echo / cowsay / fortune', 'say something, or a real fact'],
    ['theme', 'site color tokens'],
    ['ask', 'the homepage chat, not this shell'],
    ['clear', 'wipe scrollback'],
    ['date', 'local datetime'],
    ['neofetch', 'silly system card'],
    ['sudo / sl / vim', 'easter eggs'],
    ['exit', 'leave the console'],
  ];
  const width = Math.max(...rows.map(([cmd]) => cmd.length));
  return rows.map(([cmd, desc]) => textLine(`${cmd.padEnd(width + 2)}${desc}`));
}

function whoamiLines(name: string): OutputLine[] {
  return [textLine(name || 'Vedic Varma'), textLine('full-stack + infra · CSE @ MUJ')];
}

function nowLines(content: ConsoleContent): OutputLine[] {
  const [current, ...previous] = content.experience;
  const lines: OutputLine[] = [textLine(`${content.name || 'Vedic Varma'} — full-stack + infra · CSE @ MUJ`)];
  if (current) {
    lines.push(textLine(`now:     ${current.role} @ ${shortCompany(current.company)} (${current.start}–${current.end})`));
  }
  if (previous.length) {
    lines.push(textLine(`before:  ${previous.map((item) => shortCompany(item.company)).join(' · ')}`));
  }
  return lines;
}

function aboutLines(content: ConsoleContent): OutputLine[] {
  const internships = content.experience.map((item) => {
    return `  ${item.role} · ${shortCompany(item.company)} · ${item.start}–${item.end}`;
  });
  const awardBits = awardFacts(content);

  return [
    textLine(`${content.name || 'Vedic Varma'} — full-stack + infra, CSE @ MUJ.`),
    textLine(''),
    textLine('Internships:'),
    ...internships.map((line) => textLine(line)),
    textLine(''),
    textLine(awardBits.length ? `Awards: ${awardBits.join('; ')}.` : 'Awards: see /#projects.'),
  ];
}

function awardFacts(content: ConsoleContent): string[] {
  const awardBits: string[] = [];
  for (const project of content.projects) {
    const blob = `${project.title} ${project.description}`;
    if (/smart india hackathon|top 3/i.test(blob) && /health dome/i.test(blob)) {
      awardBits.push('SIH 2024 top 3 (Health Dome)');
    }
    if (/1st place/i.test(blob) && /dell/i.test(blob)) {
      awardBits.push('Dell Hackathon 1st (Smart Navigator)');
    }
  }
  if (content.certifications.some((cert) => /gate/i.test(cert.title))) {
    awardBits.push('2x GATE CS');
  }
  return awardBits;
}

function shortCompany(company: string): string {
  return company.replace(/, Advanced Software Engineering Lab/i, '').trim();
}

function certLines(certifications: Certification[]): OutputLine[] {
  if (!certifications.length) {
    return [textLine('(none)')];
  }
  return certifications.flatMap((cert, index) => {
    const lines: OutputLine[] = [textLine(cert.title)];
    const meta = [cert.provider, cert.duration].filter(Boolean).join(' · ');
    if (meta) {
      lines.push(textLine(`  ${meta}`));
    }
    if (cert.link) {
      lines.push([{ kind: 'text', text: '  ' }, { kind: 'link', href: cert.link, label: cert.link }]);
    }
    if (index < certifications.length - 1) {
      lines.push(textLine(''));
    }
    return lines;
  });
}

function projectDetailLines(project: Project): OutputLine[] {
  const lines: OutputLine[] = [
    textLine(project.title),
    textLine(`id: ${projectId(project)}`),
  ];
  if (project.description) {
    lines.push(textLine(''), textLine(oneLine(project.description)));
  }
  if (project.stack?.length) {
    lines.push(textLine(''), textLine(`stack: ${project.stack.join(' · ')}`));
  }
  if (project.link) {
    lines.push([
      { kind: 'text', text: 'link:  ' },
      { kind: 'link', href: project.link, label: project.link },
    ]);
  }
  lines.push([
    { kind: 'text', text: 'also:  ' },
    { kind: 'link', href: '/#projects', label: '/#projects' },
  ]);
  return lines;
}

function projectLines(projects: Project[]): OutputLine[] {
  return projects.map((project) => {
    const summary = oneLine(project.description);
    const segments: OutputSegment[] = [{ kind: 'text', text: `${project.title} — ${summary}` }];
    if (project.link) {
      segments.push({ kind: 'text', text: '  ' });
      segments.push({ kind: 'link', href: project.link, label: project.link });
    }
    return segments;
  });
}

function experienceLines(experience: ExperienceItem[]): OutputLine[] {
  return experience.map((item) =>
    textLine(`${item.role} · ${item.company} · ${item.start}–${item.end}`),
  );
}

function skillLines(skills: Skill[]): OutputLine[] {
  const lines: OutputLine[] = [];
  skills.forEach((group, index) => {
    const items = group.items?.length ? group.items.join('  ·  ') : '';
    lines.push(textLine(group.category));
    if (items) {
      lines.push(textLine(`  ${items}`));
    }
    if (index < skills.length - 1) {
      lines.push(textLine(''));
    }
  });
  return lines;
}

function contactLines(contact: Contact): OutputLine[] {
  const lines: OutputLine[] = [];
  if (contact.email) {
    lines.push([
      { kind: 'text', text: 'email     ' },
      { kind: 'link', href: `mailto:${contact.email}`, label: contact.email },
    ]);
  }
  const linkedin = socialUrl(contact, 'linkedin');
  if (linkedin) {
    lines.push([
      { kind: 'text', text: 'linkedin  ' },
      { kind: 'link', href: linkedin, label: linkedin },
    ]);
  }
  lines.push([
    { kind: 'text', text: 'site      ' },
    { kind: 'link', href: '/', label: '/' },
  ]);
  const github = socialUrl(contact, 'github');
  if (github) {
    lines.push([
      { kind: 'text', text: 'github    ' },
      { kind: 'link', href: github, label: github },
    ]);
  }
  return lines;
}

function githubLines(contact: Contact): OutputLine[] {
  const github = socialUrl(contact, 'github') ?? 'https://github.com/crazy-vedic';
  return [[{ kind: 'link', href: github, label: github }]];
}

function contactVerb(contact: Contact, channel: 'email' | 'linkedin' | 'whatsapp' | 'phone' | 'github'): CommandAction {
  if (channel === 'email') {
    const email = contact.email;
    if (!email) return { type: 'print', lines: [textLine('mail: no address on file')] };
    const href = `mailto:${email}`;
    return { type: 'open-url', href, lines: [[{ kind: 'link', href, label: email }]] };
  }
  if (channel === 'phone') {
    const phone = contact.phone;
    if (!phone) return { type: 'print', lines: [textLine('phone: no number on file')] };
    const href = `tel:${phone.replace(/\s+/g, '')}`;
    return { type: 'open-url', href, lines: [[{ kind: 'link', href, label: phone }]] };
  }
  const url = socialUrl(contact, channel) ?? (channel === 'github' ? 'https://github.com/crazy-vedic' : undefined);
  if (!url) return { type: 'print', lines: [textLine(`${channel}: no url on file`)] };
  return { type: 'open-url', href: url, lines: [[{ kind: 'link', href: url, label: url }]] };
}

function historyLines(history: string[]): OutputLine[] {
  if (!history.length) return [textLine('(empty)')];
  const width = String(history.length).length;
  return history.map((command, index) => textLine(`${String(index + 1).padStart(width)}  ${command}`));
}

function formatUptime(startedAt: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours > 0) return `up ${hours}h ${remMins}m ${secs}s  (this tab)`;
  if (mins > 0) return `up ${mins}m ${secs}s  (this tab)`;
  return `up ${secs}s  (this tab)`;
}

function echoText(args: string[]): string {
  return args.join(' ').slice(0, 400);
}

function wrapText(value: string, width: number): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word.slice(0, width);
      continue;
    }
    if (`${current} ${word}`.length <= width) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word.slice(0, width);
    }
  }
  if (current) lines.push(current);
  return lines;
}

function cowsayLines(message: string): OutputLine[] {
  const rows = wrapText(message, 36);
  const width = Math.max(3, ...rows.map((row) => row.length));
  const top = ` ${'_'.repeat(width + 2)}`;
  const bottom = ` ${'-'.repeat(width + 2)}`;
  const bubble = rows.map((row, index) => {
    const pad = row.padEnd(width);
    if (rows.length === 1) return `< ${pad} >`;
    if (index === 0) return `/ ${pad} \\`;
    if (index === rows.length - 1) return `\\ ${pad} /`;
    return `| ${pad} |`;
  });
  return [
    top,
    ...bubble,
    bottom,
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||',
  ].map((line) => textLine(line));
}

function fortuneFact(content: ConsoleContent): string {
  const facts = [
    'full-stack + infra · CSE @ MUJ · previously Razorpay',
    ...awardFacts(content),
    ...content.projects.map((project) => project.title),
    ...content.experience.map((item) => `${item.role} @ ${shortCompany(item.company)}`),
  ].filter(Boolean);
  return facts[Math.floor(Math.random() * facts.length)] || 'type `help`';
}

function themeLines(): OutputLine[] {
  return [
    textLine('bg        #0b0d10'),
    textLine('chrome    #101418'),
    textLine('accent    #2dd4bf'),
    textLine('muted     #9aa4ab'),
    textLine('text      #e5e7eb'),
    textLine('hairline  rgba(45, 212, 191, 0.18)'),
    textLine('font      IBM Plex Mono'),
  ];
}

function slLines(): OutputLine[] {
  return [
    textLine('      (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O'),
    textLine('     (@@@)  (@@@) (@@@@) (@@@)  (@@@@)  (@@@)'),
    textLine('    ( )  (@@@)    ( )    @@   ()   @   O    @     O     @      O'),
    textLine('   (@@@)'),
    textLine('  /====\\      choo — no steam locomotive in prod.'),
  ];
}

const MAN_PAGES: Record<string, string> = {
  help: 'list commands. this is a brochure CLI, not a real shell.',
  whoami: 'print name and one-line bio.',
  now: 'current role, school, and previous companies.',
  about: 'internships and awards from the homepage content.',
  ls: 'fake directory listing. try `ls projects`.',
  cat: 'read a path: projects, experience, skills, certifications, contact, resume.',
  projects: 'one-liners for shipped work.',
  project: 'detail one project by id. tab-complete the ids.',
  experience: 'role · company · dates.',
  skills: 'languages and infra, grouped as on the site.',
  certs: 'certifications, including GATE.',
  contact: 'email, LinkedIn, site, GitHub.',
  mail: 'print and open the mailto: link.',
  open: 'navigate to / or a homepage section. `open pdf` for the resume file.',
  resume: 'open /resume. `resume --pdf` opens the PDF.',
  pdf: 'open /resume.pdf.',
  clear: 'wipe scrollback, keep the prompt.',
  history: 'commands typed in this tab.',
  man: 'one-line manual. usage: man <command>.',
  echo: 'print arguments as text. no eval.',
  fortune: 'a real fact from the portfolio, not a quote database.',
  theme: 'the vedicvarma.com tokens this console uses.',
  ask: 'the homepage chat widget. this shell stays command-only.',
  neofetch: 'decorative system card.',
  sudo: 'politely refuses.',
  exit: 'return to /.',
  sl: 'the wrong way to type ls.',
  vim: 'you will not escape. use `exit`.',
};

function manLines(topic?: string): OutputLine[] {
  if (!topic) return [textLine('what manual page do you want? try `man help`.')];
  const key = topic.toLowerCase();
  const aliases: Record<string, string> = {
    who: 'whoami',
    stack: 'now',
    certifications: 'certs',
    email: 'mail',
    linkedin: 'contact',
    github: 'contact',
    site: 'open',
    home: 'exit',
    back: 'exit',
    palette: 'theme',
    chat: 'ask',
    cowsay: 'echo',
    uname: 'pwd',
    uptime: 'pwd',
    emacs: 'vim',
    nano: 'vim',
  };
  const resolved = aliases[key] ?? key;
  const body = MAN_PAGES[resolved];
  if (!body) return [textLine(`No manual entry for ${topic}`)];
  return [textLine(`${key}(1)`), textLine(body)];
}

function neofetchLines(content: ConsoleContent): OutputLine[] {
  const github = socialUrl(content.contact, 'github') ?? 'https://github.com/crazy-vedic';
  const label = content.name || 'vedic';
  return [
    textLine(`${label}@varma`),
    textLine('-------------'),
    textLine('OS:      vedicvarma.com'),
    textLine('Host:    CSE @ MUJ'),
    textLine('Kernel:  full-stack + infra'),
    textLine('Shell:   console'),
    textLine('Theme:   teal on #0b0d10'),
    textLine(`GitHub:  ${github}`),
  ];
}

function socialUrl(contact: Contact, platform: string): string | undefined {
  return contact.socials?.find((social) => social.platform.toLowerCase() === platform)?.url;
}

function projectId(project: Project): string {
  return project.id || slugify(project.title);
}

function findProject(
  projects: Project[],
  query: string,
): { type: 'one'; project: Project } | { type: 'many'; projects: Project[] } | { type: 'none' } {
  const needle = slugify(query);
  const scored = projects.filter((project) => {
    const id = projectId(project);
    const title = slugify(project.title);
    return id === needle || title === needle || id.includes(needle) || title.includes(needle);
  });
  if (scored.length === 1) return { type: 'one', project: scored[0] };
  if (scored.length > 1) {
    const exact = scored.filter((project) => projectId(project) === needle || slugify(project.title) === needle);
    if (exact.length === 1) return { type: 'one', project: exact[0] };
    return { type: 'many', projects: scored };
  }
  return { type: 'none' };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/\s*—\s*see (the )?post here\.?/i, '').replace(/\.\s*$/, '');
}

function textLine(text: string): OutputLine {
  return [{ kind: 'text', text }];
}
