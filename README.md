# vedicvarma.com — Portfolio Site

A data-driven portfolio site for Vedic Varma. All site content lives in `/content` as JSON files, served by Express via `GET /api/content`. The React frontend fetches that API and renders the home page dynamically — no rebuild needed to update projects, skills, experience, or certifications.

An optional AI chat widget (`POST /api/chat`) answers questions about Vedic using a self-hosted LLM (Ollama-compatible by default).

## Quick start

```bash
# Install dependencies (root + frontend)
npm install

# Build the React frontend
npm run build

# Start the server (default port 3000)
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Local development with hot reload

Run the Express server and CRA dev server in separate terminals:

```bash
# Terminal 1 — API + production build (or rebuild after changes)
npm start

# Terminal 2 — React dev server with proxy to :3000
npm run dev:frontend
```

The CRA dev server proxies `/api/*` requests to `http://localhost:3000` (configured in `frontend/package.json`).

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

After editing any JSON file, refresh the page — changes appear immediately with no server restart.

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
PORT=3000
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
  public/assets/   Static images, videos, resume.pdf
  src/
    App.js         Router + Navbar
    pages/home/    Data-driven Home page
index.js           Express server entrypoint
```

## Production deployment

1. Set `PORT` in `.env` (or use your process manager / reverse proxy).
2. Run `npm run build` then `npm start`.
3. Point your reverse proxy (nginx, Caddy, etc.) at the Node process for TLS termination.
