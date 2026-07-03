# vedicvarma.com revamp — file plan

## Architecture in one paragraph

All content (projects, skills, experience, certifications, contact info) now
lives as JSON in `/content` at the repo root — **one source of truth**, read
by the backend, never imported/bundled by React. The backend exposes
`GET /api/content`, which reads those files fresh off disk and returns them
as one JSON object. `Home.js` fetches that on mount and renders everything
from it — so adding, editing, or removing a project/skill/cert/job is a JSON
edit and a page refresh, no React code, no rebuild. The new AI chat widget
POSTs to `GET /api/chat`, which builds a system prompt out of the same
content files and forwards the conversation to your self-hosted LLM. Rock
paper scissors, the calculator, and the whole student-management module are
dropped.

Already delivered (in this output): `Home.js`, `Home.css`, and all seven
`content/*.json` files, pre-filled with your real data.

---

## API contracts

### `GET /api/content`

Returns everything `Home.js` needs in one shot:

```json
{
  "profile": { ... },        // content/profile.json
  "projects": [ ... ],       // content/projects.json
  "skills": [ ... ],         // content/skills.json
  "experience": [ ... ],     // content/experience.json
  "certifications": [ ... ], // content/certifications.json
  "contact": { ... },        // content/contact.json
  "siteConfig": { ... }      // content/siteConfig.json
}
```

### `POST /api/chat`

Request:
```json
{ "message": "What did Vedic build at DRDO?", "history": [{"role":"user"|"assistant","content":"..."}] }
```
Response:
```json
{ "reply": "..." }
```
On failure, any non-2xx status — the widget shows a generic "having trouble
connecting" bubble, no need to structure error bodies.

---

## Root

| Path | Notes |
|---|---|
| `index.js` | Modify. Add `app.use(express.json())`. Mount `app.use('/api/content', contentRouter)` and `app.use('/api/chat', chatRouter)` **before** `express.static(...)` and the existing catch-all. Keep the catch-all (`app.get('/{*splat}', ...)`) exactly as-is, and make sure it's still the last route registered. Add `require('dotenv').config()` at the top. |
| `package.json` | Add `dotenv`, `express-rate-limit`. Confirm `express` is present. If backend currently runs from a *separate* `backend/package.json`/node_modules, consolidate to this one root package.json instead — see the `backend/package.json` row below. |
| `.env.example` | New. `PORT=3000`, `MONGO_URI=`, `LLM_API_URL=http://localhost:11434`, `LLM_MODEL=llama3.1`, `LLM_API_KEY=` (blank if your local server needs none). |
| `README.md` | Update: how to run, how to edit `/content/*.json` to change what's on the site, how to point `LLM_API_URL` at your self-hosted model. |

---

## `content/` (already written by me — real data included)

| Path | Notes |
|---|---|
| `content/profile.json` | ✅ Done. `heroImage` points at `/assets/hero-desk.jpg` — drop your desk/candle photo at `frontend/public/assets/hero-desk.jpg`, or leave the field empty and the hero falls back to a gradient automatically. `roles` is an array — add more strings and the typewriter will cycle through them. |
| `content/projects.json` | ✅ Done, 7 entries. Two flags: (1) the Dell Hackathon project had a LinkedIn post link in your screenshot that was cut off mid-URL — I left `link: null`, paste the full URL in when you have it. (2) I reconstructed a 7th project ("Optimized Square Root Algorithm") from a partially-cropped card in your screenshot that mentioned "faster than Newton-Raphson" — double check that title/description match what you actually wrote. |
| `content/skills.json` | ✅ Done, all 4 categories. |
| `content/experience.json` | ✅ Done, all 3 roles, bullets as arrays so DRDO's two sentences are two list items instead of one paragraph. |
| `content/certifications.json` | ✅ Done, split into `title`/`provider`/`duration`. `link` is `null` for all — fill in if you have direct cert URLs (Coursera/edX etc.), they'll render as clickable rows automatically. |
| `content/contact.json` | ✅ Done, but has three placeholders you must replace: `formspreeEndpoint` (your real Formspree form URL), and the `github`/`whatsapp` URLs under `socials` (icons render regardless, but link nowhere useful until filled in). |
| `content/siteConfig.json` | ✅ Done — chat widget copy. Set `chat.enabled: false` here to hide the widget without touching any code. |

---

## `backend/`

| Path | Notes |
|---|---|
| `backend/mongoose.js` | Keep. Only needed now if you want to persist contact submissions or chat logs — make the connection call lazy/optional so the site still runs if Mongo isn't up. |
| `backend/routes/content.js` | **New.** `GET /api/content` — reads all 7 files from `/content` with `fs.promises.readFile` + `JSON.parse` on every request (cheap for files this small, and means edits show up on refresh with zero restart), assembles the response shape above, `res.json(...)`. Wrap each file read in try/catch so one malformed JSON file 500s with a clear message instead of crashing the process. |
| `backend/routes/chat.js` | **New.** `POST /api/chat` — validate body (`message` non-empty string, ≤ 2000 chars; `history` array capped at, say, last 20 turns), call `buildSystemPrompt()` then `askLLM()`, return `{ reply }`. Apply `express-rate-limit` here specifically (e.g. 20 requests/min/IP) since this is a public endpoint that costs you compute. |
| `backend/lib/contentStore.js` | **New.** One function, `loadContent()`, that reads and parses all `content/*.json` files and returns the combined object. Both `content.js` and `buildSystemPrompt.js` call this instead of duplicating file-reading logic. |
| `backend/lib/buildSystemPrompt.js` | **New.** Takes the object from `contentStore.js` and composes a system-prompt string: who Vedic is, his projects/skills/experience/certifications, and an instruction to answer only from that context and say "I'm not sure" rather than invent details about him. |
| `backend/lib/llmClient.js` | **New.** `async function askLLM({ systemPrompt, history, message })`. This is the *only* file to touch when you swap or reconfigure your self-hosted model — implement it against whatever you're running (Ollama's `/api/chat`, llama.cpp server, vLLM's OpenAI-compatible endpoint, LM Studio, etc.) using `LLM_API_URL` / `LLM_MODEL` / `LLM_API_KEY` from env. Everything upstream of this file only knows about `{ reply: string }`. |
| `backend/models/adminList.js` | **Remove** (student-management only). |
| `backend/models/studentList.js` | **Remove.** |
| `backend/studentManagement.js` | **Remove.** |
| `backend/assets/map.jpeg` | **Remove** (only referenced by student management, unless you know otherwise). |
| `backend/package.json`, `backend/package-lock.json` | Decide: if `index.js` at the root just does `require('./backend/mongoose.js')` directly (not as an installed package), these are redundant — merge `mongoose` into the root `package.json` and delete this pair. Keep only if you deliberately run backend as an isolated workspace. |

---

## `frontend/`

| Path | Notes |
|---|---|
| `frontend/webpack.config.js` | Modify. Add `devServer.proxy: { '/api': 'http://localhost:3000' }` (or whatever `PORT` you set) so `fetch('/api/...')` works when running the webpack dev server separately from Express in local dev. Not needed in production since Express serves the built frontend itself. |
| `frontend/src/index.js` | Keep. Confirm it renders `<App />` (or your router root) into `#root` inside a `BrowserRouter`. |
| `frontend/src/App.js` | **New**, if it doesn't already exist under this name — route table: `/` → `Home`, `/resume` → `Resume`, `*` → `Error404`. Render `<Navbar />` once above `<Routes>` so it persists across pages. |
| `frontend/src/components/Navbar.js` | Modify. Keep it to the 3 existing links (Portfolio → `#projects`, Resume → `/resume`, Contact → `#contact`) — simplest option, nav rarely changes. If you'd rather it also be data-driven off `profile.nav`, lift the `/api/content` fetch up to `App.js`, put it in a small React Context, and have both `Navbar` and `Home` read from that context instead of `Home` fetching on its own (avoids a duplicate network call). I built `Home.js` to fetch independently so it stays a self-contained drop-in; this is an optional refinement. |
| `frontend/src/components/Typewriter.js` | **Remove** (or repurpose) — `Home.js` now has its own internal `useTypewriter` hook, so this becomes dead code unless something else imports it. |
| `frontend/src/pages/home/Home.js` | **Replace** with the file delivered here. |
| `frontend/src/pages/home/Home.css` | **New** — delivered here. |
| `frontend/src/pages/home/index.html` | **Remove** (legacy static page, superseded by the React page). |
| `frontend/src/pages/home/styles.css` | **Remove** (superseded by `Home.css`). |
| `frontend/src/pages/home/calculator.html` | **Remove** (per your note — nothing references it from the plan above). |
| `frontend/src/pages/home/rockpaperscissors.html` | **Remove.** |
| `frontend/src/pages/Projects.js` | Evaluate — tiny (283 bytes), likely a thin wrapper or redirect. If nothing links to a standalone `/projects` route anymore (the anchor `#projects` on the home page covers it), remove it; otherwise keep as a dedicated route later. |
| `frontend/src/pages/Resume.js` | Keep as-is — serves/downloads `resume.pdf`. |
| `frontend/src/pages/Error404.js` | Keep as-is. |
| `frontend/src/pages/resume.pdf` | **Move** to `frontend/public/resume.pdf` so it's a stable static asset at `/resume.pdf`, matching `profile.resumeUrl` in `content/profile.json`, instead of a webpack-bundled import. |
| `frontend/src/pages/studentManagement/Dashboard.js` | **Remove.** |
| `frontend/src/pages/studentManagement/Dashboard.css` | **Remove.** |
| `frontend/src/pages/studentManagement/Login.js` | **Remove.** |
| `frontend/src/pages/studentManagement/Login.module.css` | **Remove.** |
| `frontend/src/pages/studentManagement/StudentManagementNo404Page.js` | **Remove.** |
| `frontend/src/components/rock-emoji.png`, `scissors-emoji.png`, `paper-emoji.png`, `cancel.png`, `check.png` | **Remove** (rock-paper-scissors only). |
| `frontend/src/components/github.png`, `instagram.png`, `linkedin.png` | Optional removal — `Home.js` now renders those icons as inline SVG, so these files are no longer required by the home page. Keep only if `Navbar.js` or something else still references them. |
| `frontend/src/components/settings.png`, `theme.png` | Verify usage elsewhere before removing — not referenced by anything in this plan. |
| `frontend/src/components/v.png` | Keep — used as the logo mark in `Navbar.js`. |
| `frontend/src/components/background.jpeg` | Keep only if you want it as a texture somewhere; the new hero uses `profile.heroImage` instead. |
| `frontend/src/components/libraryManagementSystem.png` | **Move** to `frontend/public/assets/projects/library-management-system.png` (matches the path already set in `content/projects.json`). |
| `frontend/src/components/stella.png` | **Move** to `frontend/public/assets/projects/stella.png`. |
| `frontend/src/components/pathfinding.mp4` | **Move** to `frontend/public/assets/projects/pathfinding.mp4`. |
| `frontend/src/components/PMGMTS.mp4` | **Move** to `frontend/public/assets/projects/placement-management-system.mp4`. |
| *(missing)* Dell Hackathon screenshot | Not in your file listing — add one at `frontend/public/assets/projects/dell-hackathon.png`, or set that project's `media` to `null` in `content/projects.json` to use the automatic fallback tile. |

Moving project media into `frontend/public/assets/...` (rather than importing
them in JS) is what makes them swappable from `content/projects.json` without
a rebuild — same reasoning as the `/content` folder itself.

---

## Environment variables (`.env`, gitignored)

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/vedicvarma   # optional, only if you persist chat/contact logs
LLM_API_URL=http://localhost:11434                # wherever your self-hosted model listens
LLM_MODEL=llama3.1
LLM_API_KEY=                                      # blank if not needed
```

## Open items for you

1. Drop a real `formspreeEndpoint` into `content/contact.json`.
2. Fill in real `github`/`whatsapp` URLs in `content/contact.json`.
3. Confirm the reconstructed "Optimized Square Root Algorithm" project entry and the Dell Hackathon link (both flagged above).
4. Decide what your self-hosted LLM setup actually is, so `backend/lib/llmClient.js` can be written against its real API.
