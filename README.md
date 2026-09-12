# प्राजक्तप्रभा

A personal creative archive for **प्राजक्तप्रभा**'s poetry, personal essays, and traditional Marathi verse — built to be beautiful, dignified, and entirely hers to maintain without touching code, git, or a terminal.

**Live site:** https://prajaktacreations11.github.io/prajakta-prabha/

This is deliberately *not* a general-purpose blogging platform or a commercial content product — see [`spec/mission.md`](spec/mission.md) for the full reasoning and explicit non-goals.

## Content

Three forms, one author:

- **काव्य-संग्रह** (Poetry) — original poems
- **आठवणींचा ठेवा** (Articles) — memoir-style personal essays and reflections
- **उखाणे** (Ukhane) — traditional Marathi wedding verses

## Architecture, in short

This is a **client-rendered SPA blog**, not a traditional full-stack app, despite the Express scaffold under `server/`. Posts are Markdown files with YAML frontmatter under `client/src/content/{poetry,articles,ukhane}/*.md` — the filename becomes the URL slug, the folder becomes the category. There is no database and no content API: everything is compiled into the client bundle at build time. Routing is client-side only, via `wouter`.

Content is authored through [Decap CMS](https://decapcms.org/) (`client/public/admin/`), which commits Markdown files directly to this repo via the GitHub API — see [`AUTHORING.md`](AUTHORING.md) for the author-facing walkthrough.

The site is built and deployed as static files to **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`) — nothing runs a server in production.

For the full architecture write-up (content pipeline, search/transliteration, per-post share previews, RSS, image optimization, etc.), see [`CLAUDE.md`](CLAUDE.md). For what's planned vs. done, see [`spec/spec.md`](spec/spec.md). For what's actually load-bearing in the dependency tree vs. unused scaffold, see [`spec/tech-stack.md`](spec/tech-stack.md).

## Getting started

Requires Node.js (developed against Node 24) and npm.

```bash
npm install
npm run dev
```

This starts a dev server (Vite middleware + Express) on `PORT` (default `5000`).

To test the Decap CMS locally without GitHub OAuth, run `npx decap-server` alongside `npm run dev`, then visit `/admin/index.html` (the trailing filename is required in dev mode).

## Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server (Vite + Express) on `PORT`, default 5000 |
| `npm run build` | Full production build: Vite client build + server bundle, then image optimization, prerendering, and RSS generation |
| `npm run prerender` | Bake per-post OG/Twitter tags into `dist/public/post/<slug>/index.html` (needs a prior `vite build`) |
| `npm run rss` | Write `dist/public/rss.xml` (needs a prior `vite build`) |
| `npm run optimize-images <dir>` | Recompress images in place in `<dir>` (e.g. `client/public/blog-images` or `dist/public/blog-images`) |
| `npm start` | Run the production build (requires `npm run build` first) |
| `npm run check` | Type-check the whole project with `tsc` |

There is no test suite configured in this repo.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes `dist/public` to GitHub Pages. No server is deployed — GitHub Pages serves the built static files directly.

Content authoring uses a separate, small Cloudflare Worker (`oauth-proxy/`) to proxy the GitHub OAuth token exchange for Decap CMS logins in production. See [`oauth-proxy/README.md`](oauth-proxy/README.md) for its deployment.

## License

MIT
