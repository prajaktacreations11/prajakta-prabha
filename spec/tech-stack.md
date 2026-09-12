# Tech Stack

What's actually running this project, why each piece is here, and — importantly — what's present but **not** currently load-bearing. That distinction matters: this codebase started from a generic Replit full-stack scaffold, and Phase 8 (`spec.md`) pruned nearly everything that scaffold added and nothing ever used — the database layer, auth scaffolding, dead server routes, unused TanStack Query wiring, and (on a second pass) 43 of 47 scaffolded shadcn/ui primitives and every npm package whose only consumer was one of them. What's left below and marked dev-only is intentional, not leftover.

## Build & language

| Tool | Role |
|---|---|
| **Vite 5** | Dev server + client build. Client root is `client/`, output goes to `dist/public`. |
| **TypeScript 5.6** | Used across client, server, and the `scripts/` build tools (`tsc --noEmit` via `npm run check`; no separate linter is configured). |
| **esbuild** | Bundles the production server entry (`server/index-prod.ts`) into `dist/index.js`. |
| **tsx** | Already a devDependency (runs the dev server); also runs the build-time scripts under `scripts/` (prerendering, RSS, image compression) as plain Node/TypeScript after `vite build`. |
| **sharp** | devDependency, added in Phase 6. Recompresses images at build time (`scripts/optimize-images.ts`) — libvips-based, prebuilt binaries for the platforms this project actually runs on (Windows dev, Ubuntu CI), no native compilation needed. |

## Frontend (this is the actual product)

| Tool | Role |
|---|---|
| **React 18** | UI library. |
| **wouter** | Client-side routing — small, hook-based, no server-rendering support. |
| **Tailwind CSS 3 + shadcn/ui** (`"new-york"` style) | Styling and component primitives — but only 4 of the originally-scaffolded 47 shadcn primitives are actually used: `badge`, `button`, `card`, `input` (each backed by one Radix package: `@radix-ui/react-slot`, used by `button`, is the only Radix dependency left). Configured via `components.json`, kept so `npx shadcn add <name>` can re-add a primitive if a real need shows up; design tokens and spacing conventions documented in `design_guidelines.md`. See `spec.md` Phase 8 for the audit that found the other 43 unreachable and removed them, along with every dependency (`react-hook-form`, `recharts`, `cmdk`, `vaul`, `embla-carousel-react`, `react-day-picker`, `react-resizable-panels`, `input-otp`, `@hookform/resolvers`, `tailwindcss-animate`, and 27 more `@radix-ui/*` packages) whose only consumer was one of them. |
| **react-markdown** | Renders post body Markdown to HTML on `PostPage`. |
| **lucide-react** / **react-icons** | Icon sets. |
| **js-yaml** | Parses YAML frontmatter in content files — deliberately a real YAML parser (not hand-rolled) so it correctly handles both simple inline frontmatter and the multi-line list style the CMS writes. |

## Content model

Content is **not** stored in a database. It's Markdown files with YAML frontmatter under `client/src/content/{poetry,articles,ukhane}/*.md`, loaded eagerly at build time and compiled directly into the JS bundle. There is no content API and no runtime fetch for posts. The category list itself lives in `client/src/lib/categories.ts`, which both the loader and the UI read.

Post parsing (`client/src/lib/posts.ts`) is environment-agnostic on purpose: `client/src/lib/content.ts` supplies files via Vite's `import.meta.glob` for the browser build, and the `scripts/` build-time generators (below) supply files via plain `fs.readdirSync` — both call the same `parsePosts()`, so a post's excerpt/thumbnail/category derivation can't drift between what the site shows and what the RSS feed or a share preview shows.

**Per-post share previews, the RSS feed, and image compression** (`spec/spec.md` Phases 5, 6 & 7) run as three Node scripts — `scripts/prerender-posts.ts`, `scripts/generate-rss.ts`, `scripts/optimize-images.ts` — invoked after `vite build` by both `npm run build` and `.github/workflows/deploy.yml`. Prerendering exists because social scrapers (WhatsApp, Facebook, Twitter/X) fetch raw HTML and never execute JS — a client-side `useDocumentMeta` hook keeps the live SPA's tab title and meta tags correct per route, but only a real static file per post (`dist/public/post/<slug>/index.html`) is visible to a scraper. Image optimization runs against `dist/public/blog-images`, recompressing whatever Decap's media widget uploaded (at whatever size and format the author's phone produced) before it's ever served — same filename, same extension, so nothing that references it needs to change. No new runtime dependency for the first two — both are plain Node/TypeScript via `tsx`; image compression is the one addition, `sharp` (see Build & language above), used only at build time.

**No social media integration.** There is no Instagram/YouTube/Facebook API client, widget, embed script, or access token anywhere in this project, and by decision there should not be — see `spec/spec.md` Phase 3. Social platforms are linked to from `client/src/lib/social.ts` and nothing more; that keeps the site free of third-party JS, tracking cookies, and expiring credentials, all of which `mission.md` rules out.

## Content authoring

**Decap CMS** (`client/public/admin/`) — a git-backed headless CMS. It gives a non-technical author a web form that commits Markdown files with correct frontmatter directly to this repo via the GitHub API, so the content model above stays the single source of truth. Configured for the `prajaktacreations11/prajakta-prabha` repo, `main` branch; supports local testing without OAuth via `local_backend: true` + `npx decap-server`.

**Production auth** — a Cloudflare Worker (`oauth-proxy/`, deployed separately from the main site) proxies GitHub's OAuth token exchange, since the client secret can't live in the browser. The author logs in with a dedicated GitHub account through GitHub's own screen (not Google sign-in — see `spec.md` Phase 2 for why). See `oauth-proxy/README.md` for deployment and `AUTHORING.md` for the author-facing walkthrough.

## Backend (dev-only, not part of the deployed site)

`server/` (Express 4) exists only to run and preview the app locally: `npm run dev` for development, `npm start` for a local production-build smoke test. It's a valid pattern for a static site to still use during development — Vite's own dev server would need the same middleware-mode wrapper for anything custom, and this is what `index-dev.ts` provides. On GitHub Pages nothing runs this server at all; `.github/workflows/deploy.yml` uploads the built `dist/public` directory as static files directly.

**Phase 8 (`spec/spec.md`) removed everything this section used to describe as scaffolded-but-unused**: `server/routes.ts` (an empty route registry — nothing ever called it beyond a trivial HTTP-server wrapper, now inlined in `app.ts`), `server/storage.ts` (an in-memory `MemStorage` nothing referenced), Drizzle ORM + `@neondatabase/serverless` + `shared/schema.ts` + `drizzle.config.ts` (a Postgres `users` table with no database behind it — content lives in Markdown, not a DB; see Content model above), and Passport + `express-session` + `connect-pg-simple` + `memorystore` (auth scaffolding with no login flow — authoring is authenticated by GitHub OAuth via Decap, not by this app). `@tanstack/react-query` went too — wired into `App.tsx` (Frontend, above) but zero `useQuery`/`useMutation` calls anywhere; removing it also shrank the client JS bundle by ~27KB.

## Original scaffold origin

- **Replit** — `.replit`, and the `@replit/vite-plugin-cartographer` / `@replit/vite-plugin-dev-banner` / `@replit/vite-plugin-runtime-error-modal` devDependencies are Replit's AI-agent dev tooling. They're harmless in a non-Replit environment (they no-op outside a Replit container) but are a strong signal of where this codebase came from.

## Tooling notes worth knowing

- **cross-env** was added so `npm run dev` / `npm run start`'s inline `NODE_ENV=...` syntax works on Windows (`cmd.exe` doesn't understand POSIX-style env var prefixes).
- `server.listen(...)` in `server/app.ts` conditionally omits `reusePort` on `win32` — that option is Linux-only and throws `ENOTSUP` on Windows.

## Package manager & runtime

- **npm** (not yarn/pnpm — `package-lock.json` is the lockfile in use).
- **Node.js** — no `.nvmrc`/`engines` field pins a version; developed against Node 24.

## Hosting

**Decided: GitHub Pages**, deployed via GitHub Actions from this repo, at the default project URL:

```
https://prajaktacreations11.github.io/prajakta-prabha/
```

No custom domain for now — free, zero DNS setup, and a custom domain can be attached later without changing the deploy mechanism. See `spec.md` Phase 1 for the remaining setup tasks (base path, workflow, SPA deep-link handling).
