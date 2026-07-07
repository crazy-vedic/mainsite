import fs from 'fs/promises';
import path from 'path';
import type { SiteContent } from '../types/content';

const CONTENT_DIR = path.join(process.cwd(), '..', 'content');

const FILES = {
  profile: 'profile.json',
  projects: 'projects.json',
  skills: 'skills.json',
  experience: 'experience.json',
  certifications: 'certifications.json',
  contact: 'contact.json',
  siteConfig: 'siteConfig.json',
} satisfies Record<keyof SiteContent, string>;

async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(CONTENT_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    const errorLike = err as { code?: string; message?: string };
    const message =
      errorLike.code === 'ENOENT'
        ? `Missing content file: ${filename}`
        : `Invalid JSON in ${filename}: ${errorLike.message ?? 'Unknown error'}`;
    const error = new Error(message) as Error & { statusCode?: number };
    error.statusCode = 500;
    throw error;
  }
}

export async function loadContent(): Promise<SiteContent> {
  const entries = await Promise.all(
    (Object.entries(FILES) as [keyof SiteContent, string][]).map(async ([key, filename]) => {
      const value = await readJsonFile<SiteContent[typeof key]>(filename);
      return [key, value] as const;
    }),
  );

  return Object.fromEntries(entries) as SiteContent;
}
