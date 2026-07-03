import { useState, useEffect, useRef, useCallback } from 'react';
import './Home.css';

/* ============================================================
   Icons — tiny inline SVGs, no image assets or icon packages
   required so this file has zero external dependencies.
   ============================================================ */

const IconGithub = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18.91-.26 1.89-.38 2.86-.39.97.01 1.95.13 2.86.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

const IconWhatsapp = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.93-.26-.1-.46-.15-.65.15-.2.29-.75.93-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.2.05-.37-.02-.51-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.49-.65-.5h-.56c-.19 0-.51.07-.78.37-.26.29-1.02 1-1.02 2.43s1.05 2.82 1.19 3.01c.15.19 2.06 3.15 5 4.42.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34ZM12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.08L2 22l5.08-1.33A9.95 9.95 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm0 18.13a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.02.79.8-2.94-.19-.3a8.13 8.13 0 1 1 6.84 3.76Z" />
  </svg>
);

const IconMail = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
    <path d="M3.5 6.2 12 12.5l8.5-6.3" />
  </svg>
);

const IconExternal = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const IconSend = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M2 12 21 3l-4 18-6-6-5 3z" />
  </svg>
);

const IconClose = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
);

const IconChat = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M4 5.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H9l-4.6 3.45A.5.5 0 0 1 3.6 20V17H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z" />
  </svg>
);

/* ============================================================
   Typewriter hook — cycles through profile.roles. Works fine
   with a single entry too (it just types, pauses, and retypes).
   ============================================================ */

function useTypewriter(words, { typingSpeed = 70, deletingSpeed = 40, pause = 1800 } = {}) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return undefined;
    const current = words[wordIndex % words.length];
    let timeout;

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === '') {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText((t) => current.slice(0, deleting ? t.length - 1 : t.length + 1));
      }, deleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, typingSpeed, deletingSpeed, pause]);

  return text;
}

/* ============================================================
   Hero
   ============================================================ */

function Hero({ profile }) {
  const roles = profile?.roles?.length ? profile.roles : ['A Researcher'];
  const typed = useTypewriter(roles);
  const heroImage = profile?.heroImage;

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="hero"
      style={heroImage ? { '--hero-image': `url(${heroImage})` } : undefined}
    >
      <div className={`hero__backdrop ${heroImage ? 'hero__backdrop--photo' : 'hero__backdrop--gradient'}`} />
      <div className="hero__content">
        <p className="eyebrow">// portfolio</p>
        <h1 className="hero__headline">
          {typed}
          <span className="caret" aria-hidden="true" />
        </h1>
        {profile?.name && <p className="hero__name">{profile.name}</p>}
        <button className="hero__scroll" onClick={scrollToProjects} type="button">
          See the work ↓
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   Projects
   ============================================================ */

function ProjectCard({ project }) {
  const { title, description, stack = [], media, link } = project;

  return (
    <article className="project-card">
      <div className="project-card__media">
        {media?.type === 'video' && media?.src ? (
          <video src={media.src} muted loop playsInline autoPlay />
        ) : media?.type === 'image' && media?.src ? (
          <img src={media.src} alt={title} loading="lazy" />
        ) : (
          <div className="project-card__media-fallback" aria-hidden="true">
            <span>{title?.charAt(0) || '?'}</span>
          </div>
        )}
      </div>
      <div className="project-card__body">
        <h3>{title}</h3>
        <p>{description}</p>
        {stack.length > 0 && (
          <ul className="tag-list">
            {stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        {link && (
          <a className="project-card__link" href={link} target="_blank" rel="noreferrer">
            View <IconExternal />
          </a>
        )}
      </div>
    </article>
  );
}

function ProjectsSection({ projects }) {
  if (!projects || projects.length === 0) return null;
  return (
    <section id="projects" className="section">
      <p className="eyebrow">// projects</p>
      <h2 className="section__title">Projects</h2>
      <div className="project-grid">
        {projects.map((p) => (
          <ProjectCard key={p.id || p.title} project={p} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Skills
   ============================================================ */

function SkillCard({ skill }) {
  return (
    <div className="skill-card">
      <h3>{skill.category}</h3>
      <p className="skill-card__list">
        {skill.note ? <span className="skill-card__note">{skill.note}: </span> : null}
        {skill.items?.join(', ')}
      </p>
    </div>
  );
}

function SkillsSection({ skills }) {
  if (!skills || skills.length === 0) return null;
  return (
    <section id="skills" className="section">
      <p className="eyebrow">// skills</p>
      <h2 className="section__title">Skills</h2>
      <div className="skill-grid">
        {skills.map((s) => (
          <SkillCard key={s.category} skill={s} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Experience
   ============================================================ */

function ExperienceItem({ item }) {
  const bullets = Array.isArray(item.bullets) ? item.bullets : item.bullets ? [item.bullets] : [];
  return (
    <div className="experience-item">
      <div className="experience-item__meta">
        <span className="experience-item__dates">
          {item.start} — {item.end}
        </span>
      </div>
      <div className="experience-item__content">
        <h3>{item.role}</h3>
        <p className="experience-item__org">
          {item.company}
          {item.location ? ` · ${item.location}` : ''}
        </p>
        {bullets.length > 0 && (
          <ul>
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ExperienceSection({ experience }) {
  if (!experience || experience.length === 0) return null;
  return (
    <section id="experience" className="section">
      <p className="eyebrow">// experience</p>
      <h2 className="section__title">Experience</h2>
      <div className="experience-list">
        {experience.map((item, i) => (
          <ExperienceItem key={i} item={item} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Certifications
   ============================================================ */

function CertificationRow({ cert }) {
  const content = (
    <>
      <span className="cert-row__title">{cert.title}</span>
      <span className="cert-row__meta">{[cert.provider, cert.duration].filter(Boolean).join(' · ')}</span>
    </>
  );
  return cert.link ? (
    <a className="cert-row cert-row--link" href={cert.link} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    <div className="cert-row">{content}</div>
  );
}

function CertificationsSection({ certifications }) {
  if (!certifications || certifications.length === 0) return null;
  return (
    <section id="certifications" className="section">
      <p className="eyebrow">// certifications</p>
      <h2 className="section__title">Certifications</h2>
      <div className="cert-list">
        {certifications.map((c, i) => (
          <CertificationRow key={i} cert={c} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Contact — posts to Formspree via fetch so the page never
   reloads. Endpoint comes from content/contact.json.
   ============================================================ */

function ContactSection({ contact }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact?.formspreeEndpoint) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(contact.formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (!contact) return null;

  const iconFor = (platform) => {
    if (platform === 'github') return <IconGithub />;
    if (platform === 'whatsapp') return <IconWhatsapp />;
    return <IconMail />;
  };

  return (
    <section id="contact" className="section">
      <p className="eyebrow">// contact</p>
      <h2 className="section__title">Contact</h2>
      <div className="contact-grid">
        <div className="contact-info">
          {contact.socials?.length > 0 && (
            <div className="contact-info__socials">
              {contact.socials.map((s) => (
                <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" aria-label={s.platform}>
                  {iconFor(s.platform)}
                </a>
              ))}
            </div>
          )}
          {contact.email && (
            <>
              <h3>Email</h3>
              <a className="contact-info__email" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </>
          )}
          <p className="contact-info__footer">
            © {new Date().getFullYear()} {contact.footerName || ''}. {contact.footerNote || ''}
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {contact.formIntro && <p className="contact-form__intro">{contact.formIntro}</p>}
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Message"
            rows={5}
            value={form.message}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Submit'}
          </button>
          {status === 'sent' && (
            <p className="contact-form__status contact-form__status--ok">
              Thanks — I'll get back to you soon.
            </p>
          )}
          {status === 'error' && (
            <p className="contact-form__status contact-form__status--err">
              Something went wrong — email me directly instead.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

/* ============================================================
   Chat widget — talks to a self-hosted LLM through /api/chat.
   The backend owns the system prompt / model choice; this
   component only knows about { message, history } -> { reply }.
   ============================================================ */

function ChatWidget({ config, name }) {
  const enabled = config?.enabled !== false;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: config?.greeting || `Hi! Ask me anything about ${name || 'Vedic'}.` },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || "I couldn't find an answer to that." }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: "I'm having trouble connecting right now — try again in a moment." },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    if (e.key === 'Escape') setOpen(false);
  };

  if (!enabled) return null;

  return (
    <div className={`chat-widget ${open ? 'chat-widget--open' : ''}`}>
      {open && (
        <div className="chat-panel" role="dialog" aria-label={config?.title || 'Chat'}>
          <div className="chat-panel__header">
            <span>{config?.title || `Ask about ${name || 'me'}`}</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              <IconClose />
            </button>
          </div>

          <div className="chat-panel__messages" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="chat-bubble chat-bubble--assistant chat-bubble--typing" aria-live="polite">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          <div className="chat-panel__input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={config?.placeholder || 'Ask something…'}
              rows={1}
            />
            <button type="button" onClick={send} disabled={sending || !input.trim()} aria-label="Send message">
              <IconSend />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="chat-widget__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <IconClose /> : <IconChat />}
      </button>
    </div>
  );
}

/* ============================================================
   Home — fetches everything from /api/content once, then hands
   each section its own slice of data. Add or remove a project,
   a skill, a role, a cert, etc. by editing the JSON files in
   /content — nothing here needs to change.
   ============================================================ */

export default function Home() {
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  const loadContent = useCallback(() => {
    setStatus('loading');
    fetch('/api/content')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((data) => {
        setContent(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  if (status === 'loading') {
    return (
      <div className="home-page home-page--loading">
        <p className="loading-text">
          loading<span className="caret" aria-hidden="true" />
        </p>
      </div>
    );
  }

  if (status === 'error' || !content) {
    return (
      <div className="home-page home-page--error">
        <p>Couldn't load the page content.</p>
        <button type="button" onClick={loadContent}>
          Try again
        </button>
      </div>
    );
  }

  const { profile, projects, skills, experience, certifications, contact, siteConfig } = content;

  return (
    <div className="home-page">
      <Hero profile={profile} />
      <ProjectsSection projects={projects} />
      <SkillsSection skills={skills} />
      <ExperienceSection experience={experience} />
      <CertificationsSection certifications={certifications} />
      <ContactSection contact={contact} />
      <ChatWidget config={siteConfig?.chat} name={profile?.name} />
    </div>
  );
}
