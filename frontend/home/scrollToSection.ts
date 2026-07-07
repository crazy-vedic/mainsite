'use client';

export function scrollToSection(hash: string): void {
  const id = hash.replace(/^#/, '');
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
