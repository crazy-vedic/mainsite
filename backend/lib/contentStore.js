const fs = require('fs/promises');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', '..', 'content');

const FILES = {
  profile: 'profile.json',
  projects: 'projects.json',
  skills: 'skills.json',
  experience: 'experience.json',
  certifications: 'certifications.json',
  contact: 'contact.json',
  siteConfig: 'siteConfig.json',
};

async function readJsonFile(filename) {
  const filePath = path.join(CONTENT_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    const message = err.code === 'ENOENT'
      ? `Missing content file: ${filename}`
      : `Invalid JSON in ${filename}: ${err.message}`;
    const error = new Error(message);
    error.statusCode = 500;
    throw error;
  }
}

async function loadContent() {
  const entries = await Promise.all(
    Object.entries(FILES).map(async ([key, filename]) => {
      const value = await readJsonFile(filename);
      return [key, value];
    }),
  );
  return Object.fromEntries(entries);
}

module.exports = { loadContent };
