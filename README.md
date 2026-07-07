# vedicvarma.com — Portfolio Site

A data-driven portfolio site for Vedic Varma. All site content lives in `/content` as JSON files. The Next.js frontend reads those files server-side and renders the home page with SSG + ISR, while Express serves the `/api/content` and `/api/chat` endpoints on an internal API port.

An optional AI chat widget (`POST /api/chat`) answers questions about Vedic using a self-hosted LLM (Ollama-compatible by default).

## Quick start

```bash
# Install dependencies (root + frontend)
npm install

# Build the Next.js frontend
npm run build

# Start Next.js + Express
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Local development with hot reload

Run Next.js and Express together:

```bash
# Next.js on :3000, Express API on :3001
npm run dev
```

Next.js rewrites `/api/*` requests to the internal Express server on `http://localhost:3001`.

## Editing site content

All content is in the `/content` folder:

| File | What it controls |
|---|---|
| `profile.json` | Name, hero roles (typewriter), hero image, resume URL, nav links |
| `projects.json` | Project cards (title, description, stack, media, link) |
| `skills.json` | Skill categories |
| `experience.json` | Work history with bullet points |
| `certifications.json` | Certifications list |
| `contact.json` | Email, Formspree endpoint, social links, footer text |
| `siteConfig.json` | Chat widget copy and `chat.enabled` toggle |

After editing any JSON file, refresh the page. In development the change is immediate; in production ISR republishes the rendered HTML within roughly 60 seconds.

### Project media

Place images and videos in `frontend/public/assets/projects/` and reference them in `projects.json`:

```json
"media": { "type": "image", "src": "/assets/projects/my-project.png" }
```

Set `"media": null` to use the automatic fallback tile.

### Hero image

Set `profile.heroImage` to a public path (e.g. `/assets/hero-desk.jpg`) or leave it empty for the gradient fallback.

### Contact form

Update `contact.formspreeEndpoint` with your Formspree form URL.

### Chat widget

Set `siteConfig.json` → `chat.enabled` to `false` to hide the widget without touching code.

Configure the LLM in `.env` (copy from `.env.example`):

```
PORT=3001
API_ORIGIN=http://localhost:3001
SITE_URL=https://vedicvarma.com
LLM_API_URL=http://localhost:11434
LLM_MODEL=llama3.1
LLM_API_KEY=
```

The chat endpoint is rate-limited to **1 request per minute per IP**.

To swap LLM providers, edit only `backend/lib/llmClient.js`.

## Project structure

```
content/           JSON source of truth
backend/
  lib/             contentStore, buildSystemPrompt, llmClient
  routes/          /api/content, /api/chat
frontend/
  app/             Next App Router pages and layout
  components/      Shared client components such as Navbar
  home/            Home page sections and interactive client pieces
  chat/            Chat widget and SSE helpers
  public/assets/   Static images, videos, resume.pdf
index.js           Express API entrypoint
```

## Production deployment

1. Set `PORT=3001`, `API_ORIGIN`, and `SITE_URL` in `.env`.
2. Run `npm run build` then `npm start`.
3. Point your reverse proxy (nginx, Caddy, etc.) at the Next.js process on port `3000`.
4. Keep Express on port `3001` internal only; Next proxies `/api/*` to it.
