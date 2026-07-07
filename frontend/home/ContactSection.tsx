'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { IconGithub, IconMail, IconWhatsapp } from '../icons';
import type { Contact } from '../types/content';

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

type ContactStatus = 'idle' | 'sending' | 'sent' | 'error';

function iconFor(platform: string) {
  if (platform === 'github') return <IconGithub />;
  if (platform === 'whatsapp') return <IconWhatsapp />;
  return <IconMail />;
}

type ContactSectionProps = {
  contact: Contact;
};

export default function ContactSection({ contact }: ContactSectionProps) {
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<ContactStatus>('idle');

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contact.formspreeEndpoint) {
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(contact.formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="section">
      <p className="eyebrow">{'// contact'}</p>
      <h2 id="contact" className="section__title">Contact</h2>
      <div className="contact-grid">
        <div className="contact-info">
          {contact.socials?.length ? (
            <div className="contact-info__socials">
              {contact.socials.map((social) => (
                <a key={social.platform} href={social.url} target="_blank" rel="noreferrer" aria-label={social.platform}>
                  {iconFor(social.platform)}
                </a>
              ))}
            </div>
          ) : null}
          {contact.email ? (
            <>
              <h3>Email</h3>
              <a className="contact-info__email" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </>
          ) : null}
          <p className="contact-info__footer">
            © {new Date().getFullYear()} {contact.footerName || ''}. {contact.footerNote || ''}
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {contact.formIntro ? <p className="contact-form__intro">{contact.formIntro}</p> : null}
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <textarea name="message" placeholder="Message" rows={5} value={form.message} onChange={handleChange} required />
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Submit'}
          </button>
          {status === 'sent' ? (
            <p className="contact-form__status contact-form__status--ok">
              Thanks - I&apos;ll get back to you soon.
            </p>
          ) : null}
          {status === 'error' ? (
            <p className="contact-form__status contact-form__status--err">
              Something went wrong - email me directly instead.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
