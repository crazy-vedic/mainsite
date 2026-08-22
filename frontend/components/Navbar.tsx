'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import './Navbar.css';

function scrollToHash(hash: string): void {
  const id = hash.replace(/^#/, '');
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

type SectionLinkProps = {
  to: string;
  children: ReactNode;
};

function SectionLink({ to, children }: SectionLinkProps) {
  const pathname = usePathname();
  const hash = to.includes('#') ? to.slice(to.indexOf('#')) : '';

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!hash || pathname !== '/') return;
    event.preventDefault();
    scrollToHash(hash);
    window.history.pushState(null, '', hash);
  };

  return (
    <Link href={to} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="site-nav">
      <ul className="site-nav__menu">
        <li className="site-nav__item site-nav__item--logo">
          <Link href="/" aria-label="Home">
            <img src="/assets/logo.png" alt="Vedic Varma" className="site-nav__logo" />
          </Link>
        </li>
        <li className="site-nav__item">
          <SectionLink to="/#projects">Portfolio</SectionLink>
        </li>
        <li className="site-nav__item">
          <Link href="/console" aria-current={pathname === '/console' ? 'page' : undefined}>
            Console
          </Link>
        </li>
        <li className="site-nav__item">
          <Link href="/resume">Resume</Link>
        </li>
        <li className="site-nav__item">
          <SectionLink to="/#contact">Contact</SectionLink>
        </li>
      </ul>
    </nav>
  );
}
