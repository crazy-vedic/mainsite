import type { Metadata, Viewport } from 'next';
import { loadContent } from '../../lib/content';
import Console from './console';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export const revalidate = 60;

const siteUrl = process.env.SITE_URL || 'https://vedicvarma.com';

export const metadata: Metadata = {
  title: 'console — Vedic Varma',
  description: 'Interactive terminal on vedicvarma.com',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'console — Vedic Varma',
    description: 'Interactive terminal on vedicvarma.com',
    url: `${siteUrl}/console`,
    images: ['/assets/logo.png'],
  },
};

export default async function ConsolePage() {
  const content = await loadContent();

  return (
    <Console
      name={content.profile.name}
      projects={content.projects}
      experience={content.experience}
      skills={content.skills}
      contact={content.contact}
      certifications={content.certifications}
    />
  );
}
