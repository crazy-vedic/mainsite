import { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getClientId } from '../../lib/clientId';
import { useAdaptiveStream } from '../../lib/streamConsumer';
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

const IconArrowUp = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

/* ============================================================
   ScrollScene — a fixed, full-viewport layer of wireframe shapes
   rendered in real 3D via CSS perspective/transform, driven by
   scroll position. No canvas/WebGL dependency: three flat SVG
   "planes" are individually rotated and translated in a shared
   perspective container, so they read as depth as you scroll.
   rAF-throttled and passive so it doesn't fight the browser.
   ============================================================ */

function ScrollScene() {
  const sceneRef = useRef(null);
  const ticking = useRef(false);

  useEffect(() => {
    const docHeight = () =>
      Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      ) - window.innerHeight;

    const scrollY = () =>
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const update = () => {
      const el = sceneRef.current;
      if (!el) {
        ticking.current = false;
        return;
      }
      const y = scrollY();
      const max = docHeight();
      const progress = max > 0 ? y / max : 0;
      el.style.setProperty('--scroll', progress.toFixed(4));
      el.style.setProperty('--scroll-px', `${y.toFixed(0)}px`);
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="scroll-scene" ref={sceneRef} aria-hidden="true">
      <div className="scroll-scene__stage">
        <div className="scroll-scene__plane scroll-scene__plane--grid" />
        <svg className="scroll-scene__plane scroll-scene__plane--ring" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="150" />
          <circle cx="200" cy="200" r="110" />
        </svg>
        <svg className="scroll-scene__plane scroll-scene__plane--tri" viewBox="0 0 200 200">
          <polygon points="100,10 190,180 10,180" />
        </svg>
        <svg className="scroll-scene__plane scroll-scene__plane--dots" viewBox="0 0 400 400">
          {Array.from({ length: 24 }).map((_, i) => (
            <circle key={i} cx={20 + (i % 6) * 70} cy={20 + Math.floor(i / 6) * 70} r="2.4" />
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ============================================================
   ScrollToTop — small pill bottom-left, fades in after the hero,
   matches the amber/dark identity.
   ============================================================ */

function ScrollToTop() {
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      // Start fading in one viewport height down, fully visible by three.
      const start = vh;
      const end = vh * 3;
      const t = Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
      setProgress(t);
      ticking.current = false;
    };
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const handleClick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      type="button"
      className="scroll-top"
      onClick={handleClick}
      aria-label="Scroll to top"
      title="Scroll to top"
      style={{
        opacity: progress,
        // Longer travel: rises ~40px over the full fade distance.
        transform: `translateY(${(1 - progress) * 40}px) scale(${0.9 + progress * 0.1})`,
        pointerEvents: progress > 0.05 ? 'auto' : 'none',
      }}
    >
      <IconArrowUp />
    </button>
  );
}

/* ============================================================
   Hero — headline + name on the left, the LLM chat live and
   embedded on the right. No typewriter; the chat is the moment.
   ============================================================ */

function Hero({ profile, siteConfig }) {
  const heroImage = profile?.heroImage;
  const roles = profile?.roles?.length ? profile.roles : [];

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="hero"
      style={heroImage ? { '--hero-image': `url(${heroImage})` } : undefined}
    >
      <div className={`hero__backdrop ${heroImage ? 'hero__backdrop--photo' : 'hero__backdrop--gradient'}`} />
      <div className="hero__grid">
        <div className="hero__content">
          <p className="eyebrow">{'// portfolio'}</p>
          {profile?.name && <h1 className="hero__headline">{profile.name}</h1>}
          {roles.length > 0 && (
            <p className="hero__roles">{roles.join(' · ')}</p>
          )}
          <button className="hero__scroll" onClick={scrollToProjects} type="button">
            See the work ↓
          </button>
        </div>

        <div className="hero__chat">
          <ChatWidget
            config={siteConfig?.chat}
            name={profile?.name}
            variant="inline"
          />
        </div>
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
      <p className="eyebrow">{'// projects'}</p>
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
      <p className="eyebrow">{'// skills'}</p>
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
      <p className="eyebrow">{'// experience'}</p>
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
      <p className="eyebrow">{'// certifications'}</p>
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
      <p className="eyebrow">{'// contact'}</p>
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
   component sends { message, history } and reads SSE deltas.

   variant="inline"   — embedded in the hero, always open, no
                         toggle button, fills its container.
   variant="floating" — the original bottom-right bubble+panel,
                         rendered once outside the hero so people
                         can keep chatting after they scroll away.
   ============================================================ */

const CHAT_HISTORY_LIMIT = 5;

function formatRateLimitMessage(seconds) {
  return `Please wait ${seconds} second${seconds === 1 ? '' : 's'} before sending another message.`;
}

async function parseRateLimitRetryAfter(response) {
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!Number.isNaN(seconds) && seconds > 0) {
      return seconds;
    }
  }

  const reset = response.headers.get('RateLimit-Reset');
  if (reset) {
    const resetValue = parseInt(reset, 10);
    if (!Number.isNaN(resetValue)) {
      const nowSec = Math.floor(Date.now() / 1000);
      const seconds = resetValue > nowSec ? resetValue - nowSec : resetValue;
      if (seconds > 0) {
        return seconds;
      }
    }
  }

  return 60;
}

function rollbackFailedSend(setMessages, sentText) {
  setMessages((m) => {
    const next = [...m];
    const last = next[next.length - 1];

    if (last?.role === 'assistant' && !last.content) {
      next.pop();
    }

    const trailing = next[next.length - 1];
    if (trailing?.role === 'user' && trailing.content === sentText) {
      next.pop();
    }

    return next;
  });
}

function ChatMessageContent({ role, content }) {
  if (role === 'user') {
    return content;
  }

  return (
    <div className="chat-markdown chat-bubble--settled">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

const TEXT_UNITS = /(\s+|[^\s]+)/g;

function splitTextUnits(text) {
  if (!text) return [];
  return text.match(TEXT_UNITS) || [];
}

function StreamingText({ text }) {
  const prevCountRef = useRef(0);
  const units = useMemo(() => splitTextUnits(text), [text]);
  const animateFrom = prevCountRef.current;

  useLayoutEffect(() => {
    prevCountRef.current = units.length;
  }, [units.length]);

  return (
    <>
      {units.map((unit, i) => (
        <span key={i} className={i >= animateFrom ? 'chat-word' : undefined}>
          {unit}
        </span>
      ))}
    </>
  );
}

function StreamingMessage({ content, displayedText, isComplete }) {
  const [showMarkdown, setShowMarkdown] = useState(false);

  useEffect(() => {
    if (isComplete && content) {
      const id = requestAnimationFrame(() => setShowMarkdown(true));
      return () => cancelAnimationFrame(id);
    }
    setShowMarkdown(false);
    return undefined;
  }, [isComplete, content]);

  if (showMarkdown && isComplete && content) {
    return <ChatMessageContent role="assistant" content={content} />;
  }

  return <StreamingText text={displayedText} />;
}

async function readChatStream(response, { onDelta, onDone, signal }) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const line = event.split('\n').find((entry) => entry.startsWith('data: '));
        if (!line) continue;

        const payload = line.slice(6).trim();
        if (!payload) continue;

        let data;
        try {
          data = JSON.parse(payload);
        } catch {
          continue;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.delta) {
          onDelta(data.delta);
        }

        if (data.done) {
          onDone?.({ reply: data.reply, suggestions: data.suggestions || [] });
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

function ChatWidget({ config, name, variant = 'floating' }) {
  const enabled = config?.enabled !== false;
  const isInline = variant === 'inline';
  const [open, setOpen] = useState(isInline);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [rateLimitUntil, setRateLimitUntil] = useState(null);
  const [, setRateLimitTick] = useState(0);
  const [streamComplete, setStreamComplete] = useState(false);
  const listRef = useRef(null);
  const abortRef = useRef(null);

  const {
    enqueue,
    reset: resetStream,
    displayedText,
    isStreaming,
    isDraining,
    finish,
    suggestions,
    setSuggestions,
  } = useAdaptiveStream();

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (!rateLimitUntil) return undefined;

    const tick = () => {
      if (Date.now() >= rateLimitUntil) {
        setRateLimitUntil(null);
        return;
      }
      setRateLimitTick((n) => n + 1);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [rateLimitUntil]);

  const rateLimitSecondsLeft = rateLimitUntil
    ? Math.max(0, Math.ceil((rateLimitUntil - Date.now()) / 1000))
    : 0;
  const isRateLimited = rateLimitSecondsLeft > 0;

  useEffect(() => {
    if ((isInline || open) && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: config?.greeting || `Hi! Ask me anything about ${name || 'Vedic'}.` },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, displayedText]);

  const isStreamActive = sending || isStreaming || isDraining;

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || isRateLimited) return;

    setSendError(null);
    setSuggestions([]);
    setStreamComplete(false);
    resetStream();

    const history = messages
      .map(({ role, content }) => ({ role, content }))
      .slice(-CHAT_HISTORY_LIMIT);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setInput('');
    setSending(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      const clientId = getClientId();
      if (clientId) {
        headers['X-Client-Id'] = clientId;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      });

      if (res.status === 429) {
        const retryAfter = await parseRateLimitRetryAfter(res);
        setRateLimitUntil(Date.now() + retryAfter * 1000);
        rollbackFailedSend(setMessages, text);
        resetStream();
        setInput(text);
        return;
      }

      if (!res.ok) throw new Error('bad response');

      await readChatStream(res, {
        onDelta: enqueue,
        onDone: ({ reply, suggestions: chips }) => {
          finish(reply, chips, (finalReply) => {
            setMessages((m) => {
              const next = [...m];
              next[next.length - 1] = {
                role: 'assistant',
                content: finalReply || "I couldn't find an answer to that.",
              };
              return next;
            });
            setStreamComplete(true);
          });
        },
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        resetStream();
        setMessages((m) => {
          const next = [...m];
          const last = next[next.length - 1];
          if (last?.role === 'assistant' && !last.content) {
            next.pop();
          }
          return next;
        });
        return;
      }

      resetStream();
      rollbackFailedSend(setMessages, text);
      setInput(text);
      setSendError(
        err.message && err.message !== 'bad response'
          ? err.message
          : "I'm having trouble connecting right now — try again in a moment.",
      );
    } finally {
      setSending(false);
    }
  }, [
    input,
    sending,
    messages,
    isRateLimited,
    enqueue,
    finish,
    resetStream,
    setSuggestions,
  ]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    if (e.key === 'Escape' && !isInline) setOpen(false);
  };

  const handleChipClick = (chip) => {
    setInput(chip);
    setSuggestions([]);
  };

  if (!enabled) return null;

  const lastIndex = messages.length - 1;
  const showTyping =
    isStreamActive &&
    messages[lastIndex]?.role === 'assistant' &&
    !messages[lastIndex]?.content &&
    !displayedText;

  const panel = (
    <div className={`chat-panel ${isInline ? 'chat-panel--inline' : ''}`} role="dialog" aria-label={config?.title || 'Chat'}>
      <div className="chat-panel__header">
        <span>{config?.title || `Ask about ${name || 'me'}`}</span>
        {!isInline && (
          <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
            <IconClose />
          </button>
        )}
      </div>

      <div className="chat-panel__messages" ref={listRef}>
        {messages.map((m, i) => {
          const isLastAssistant = i === lastIndex && m.role === 'assistant';
          const showStreamingBubble =
            isLastAssistant && isStreamActive && (displayedText || !showTyping);

          if (showStreamingBubble) {
            return (
              <div
                key={i}
                className="chat-bubble chat-bubble--assistant chat-bubble--streaming"
                aria-live="polite"
              >
                <StreamingMessage
                  content={m.content}
                  displayedText={displayedText}
                  isComplete={streamComplete && !isDraining}
                />
              </div>
            );
          }

          if (isStreamActive && isLastAssistant && !m.content) {
            return null;
          }

          return (
            <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
              <ChatMessageContent role={m.role} content={m.content} />
            </div>
          );
        })}
        {showTyping && (
          <div className="chat-bubble chat-bubble--assistant chat-bubble--typing" aria-live="polite">
            <span />
            <span />
            <span />
          </div>
        )}
        {suggestions.length > 0 && !isStreamActive && (
          <div className="chat-suggestions" role="group" aria-label="Suggested questions">
            {suggestions.map((chip) => (
              <button
                key={chip}
                type="button"
                className="chat-suggestion-chip"
                onClick={() => handleChipClick(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {(sendError || isRateLimited) && (
        <p className="chat-panel__error" role="alert" aria-live="polite">
          {isRateLimited ? formatRateLimitMessage(rateLimitSecondsLeft) : sendError}
        </p>
      )}

      <div className="chat-panel__input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={config?.placeholder || 'Ask something…'}
          rows={1}
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || isRateLimited || !input.trim()}
          aria-label="Send message"
        >
          <IconSend />
        </button>
      </div>
    </div>
  );

  if (isInline) {
    return <div className="chat-widget chat-widget--inline">{panel}</div>;
  }

  return (
    <div className={`chat-widget ${open ? 'chat-widget--open' : ''}`}>
      {open && panel}
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
      <ScrollScene />
      <Hero profile={profile} siteConfig={siteConfig} />
      <ProjectsSection projects={projects} />
      <SkillsSection skills={skills} />
      <ExperienceSection experience={experience} />
      <CertificationsSection certifications={certifications} />
      <ContactSection contact={contact} />
      <ScrollToTop />
    </div>
  );
}