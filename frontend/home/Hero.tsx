'use client';

import type { CSSProperties } from 'react';
import ChatWidget from '../chat/ChatWidget';
import type { Profile, SiteConfig } from '../types/content';

type HeroProps = {
  profile: Profile;
  siteConfig: SiteConfig;
};

export default function Hero({ profile, siteConfig }: HeroProps) {
  const heroImage = profile.heroImage;
  const roles = profile.roles?.length ? profile.roles : [];

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const style = heroImage
    ? ({ '--hero-image': `url(${heroImage})` } as CSSProperties)
    : undefined;

  return (
    <section className="hero" style={style}>
      <div className={`hero__backdrop ${heroImage ? 'hero__backdrop--photo' : 'hero__backdrop--gradient'}`} />
      <div className="hero__grid">
        <div className="hero__content">
          <p className="eyebrow">{'// portfolio'}</p>
          {profile.name && <h1 className="hero__headline">{profile.name}</h1>}
          {roles.length > 0 && <p className="hero__roles">{roles.join(' · ')}</p>}
          <button className="hero__scroll" onClick={scrollToProjects} type="button">
            See the work ↓
          </button>
        </div>

        <div className="hero__chat">
          <ChatWidget config={siteConfig.chat} name={profile.name} variant="inline" />
        </div>
      </div>
    </section>
  );
}
