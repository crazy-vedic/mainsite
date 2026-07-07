import type { Metadata } from 'next';
import HomePage from '../home/HomePage';
import { loadContent } from '../lib/content';
import type { SiteContent } from '../types/content';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await loadContent();
  const siteUrl = process.env.SITE_URL || 'https://vedicvarma.com';

  return {
    title: profile.name || 'Vedic Varma',
    description: 'Vedic Varma — portfolio, projects, experience, and contact.',
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: profile.name || 'Vedic Varma',
      description: 'Portfolio, projects, experience, and contact.',
      url: siteUrl,
      images: ['/assets/logo.png'],
    },
  };
}

function buildPersonSchema(content: SiteContent) {
  const { profile, contact } = content;
  const siteUrl = process.env.SITE_URL || 'https://vedicvarma.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name || 'Vedic Varma',
    url: siteUrl,
    email: contact.email ? `mailto:${contact.email}` : undefined,
    sameAs: contact.socials?.map((social) => social.url) || [],
  };
}

export default async function Page() {
  const content = await loadContent();
  const personSchema = buildPersonSchema(content);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <HomePage content={content} />
    </>
  );
}
