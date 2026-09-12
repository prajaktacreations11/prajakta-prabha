# Specification & Roadmap

This document tracks what the project needs next, in service of [mission.md](./mission.md).

**How it's organized.** Work is grouped into **phases**. Each phase delivers one distinct piece of functionality and is worth shipping on its own — you should be able to stop after any phase and have left the project in a coherent state. Within a phase, each **task** has a single purpose and is sized to land as roughly one commit (a guideline, not a rule).

Each phase is labelled with a tier:

- **Core** — the mission is not actually fulfilled without it. These are half-built or missing pieces that block a stated goal in `mission.md`.
- **Polish** — real improvements grounded in gaps observed in this codebase, not speculative features. Valuable, but the mission stands without them.

Anything not listed here should be checked against `mission.md`'s non-goals before being added to any phase.

## Current state

The site is a client-rendered React SPA, live at https://prajaktacreations11.github.io/prajakta-prabha/. Content is authored as Markdown with YAML frontmatter under `client/src/content/{poetry,articles,ukhane}/` and compiled into the JS bundle at build time — there is no runtime database or API. A Decap CMS instance at `/admin` gives the author a web form for creating and editing posts, authenticated in production via a GitHub OAuth App and a Cloudflare Worker proxy (`oauth-proxy/`) — verified end-to-end with a real published post. See `CLAUDE.md` for full architecture detail.

All thirteen phases are done: the site is public, the author can self-publish from a browser with no terminal and no help, the category list lives in one module, search and tag browsing work, sharing a post previews as that post (confirmed with a real scraper against the live site), posts show a reading time, an RSS feed exists, every image is compressed with no duplication, a reader can browse the archive by year, by newest, or by tag, the repo carries no server/database/auth scaffolding it doesn't actually use, the homepage hero carousel links to real posts, and the repo/brand identity and last Replit scaffolding traces are settled. There is no open Core or Polish work left on this roadmap; new phases start from a fresh gap against `mission.md`, not from what's below.

## Phase overview

| # | Phase | Tier | Delivers |
|---|---|---|---|
| 1 | Public deployment | Core | The site exists at a URL a reader can visit |
| 2 | Production authoring | Core | She can publish on her own, from a browser |
| 3 | One source of truth for content structure | Core | Categories can't silently disagree across pages |
| 4 | Working search and tag browsing | Core | Nothing in the reader UI 404s |
| 5 | Per-post share previews | Core | A shared poem previews as that poem |
| 6 | Lighter pages | Polish | Fast to load, cheap to host, stays that way |
| 7 | Reader conveniences | Polish | Reading time, and a way to follow new work |
| 8 | Prune unused scaffolding | Polish | The codebase reads as what it actually is |
| 9 | Chronological archive view | Polish | A reader can browse posts by year, not only the newest-first feed |
| 10 | Sitewide "latest" block | Polish | A reader always has a way to see what's newest, from any post |
| 11 | Tag-filter block (tag cloud) | Polish | A reader gets an at-a-glance sense of what she writes about most |
| 12 | Content-driven hero carousel | Polish | The homepage hero links to real posts instead of being decoration |
| 13 | Repo/brand rename and scaffolding cleanup | Polish | The repo, live URL, and docs agree on one identity, and no dead Replit tooling remains |

**Sequencing notes.** Phase 2 depends on Phase 1 (the OAuth app and CMS config need a real production URL to authorize against). Phase 3 is deliberately placed before Phase 4 — Phase 4 adds new pages that would otherwise become the fifth and sixth hand-copies of the category list. Phase 8 depends on Phase 1 confirming static hosting as the long-term direction. Phases 9, 10, and 11 were originally scoped and built as a single phase (see the note at the top of Phase 9) — none of the three needs the others: 9 and 10 are pure derivations of `getAllPosts()`, and 11 depends only on Phase 4's tag plumbing (`getAllTags()`, `/tag/:tag`) already existing, not on 9 or 10. Phase 12 is a pure derivation of `getAllPosts()` too, the same category as 9 and 10. Phase 13's scaffolding-cleanup task is the deferred half of Phase 8's "still deliberately not touched" note; its rename task depends on nothing before it. Everything else is independent.

---

## Phase 1 — Public deployment · Core · ✅ Done

Live at https://prajaktacreations11.github.io/prajakta-prabha/.

**Functionality served:** the site is reachable at a public URL. Until this exists, no reader-facing part of the mission is real, and Phase 2 has nothing to authorize against.

Today `vite.config.ts` sets no `base` path and there is no deploy workflow, so nothing is live.

**Tasks**

1. **Choose the hosting target and record the decision.** Purpose: settle on a host that satisfies the mission's "costs nothing to keep running, no server to babysit" — GitHub Pages is the natural fit given content is already static and the repo is already on GitHub. Note the choice and its URL in `spec/tech-stack.md`.
2. **Configure the build for that target.** Purpose: set `base` in `vite.config.ts` to match the host's URL path so asset URLs resolve correctly once deployed.
3. **Add the deploy workflow.** Purpose: build on push to `main` and publish the output, so deployment is automatic and not a step anyone has to remember.
4. **Handle SPA deep links on the host.** Purpose: `wouter` routes like `/post/<slug>` are client-side only; a static host must serve `index.html` for unknown paths, or a shared post link opens to a 404 on refresh.
5. **Verify the live site.** Purpose: confirm every route, all content, and all images load correctly from the public URL — not just from `npm run dev`.

**Done when:** a reader can open the public URL, navigate to any post, refresh the page, and see it render.

---

## Phase 2 — Production authoring · Core · ✅ Done

**Functionality served:** the author can publish a new poem herself, from a browser, with no terminal and no help. This is the single most load-bearing promise in `mission.md`.

Decap CMS at `/admin` now authenticates in production via a GitHub OAuth App and a Cloudflare Worker proxy (`oauth-proxy/`, deployed at `https://marathibytes-decap-oauth.kulkarni-aditya12.workers.dev`). The author has her own GitHub account, which now owns `prajaktacreations11/prajakta-prabha`, and has published a real post end-to-end: logged in at `/admin`, created and published a poem, the commit landed on `main`, the deploy workflow rebuilt the site, and the post appeared live.

**Decision (2026-08-20):** the author (Aditya's wife) will use a dedicated GitHub account, tied to a dedicated Gmail kept separate from her personal one, and log in through GitHub's own screen — not a "Sign in with Google" button. The alternative (Netlify Identity + Git Gateway, which does offer literal Google sign-in) was ruled out to avoid depending on a second hosting platform just for auth. See `AUTHORING.md` for what she'll actually see.

**Tasks**

1. **Register a GitHub OAuth App** for the production domain. Purpose: give Decap a real identity to authenticate the author against the `prajaktacreations11/prajakta-prabha` repo. *(Done — `MarathiBytes CMS` OAuth App registered, callback URL points at the Worker.)*
2. **Deploy the auth proxy.** Purpose: Decap's GitHub backend needs a small server-side token exchange; built as a Cloudflare Worker in `oauth-proxy/` — this is the one piece that cannot be static. *(Done — deployed as `marathibytes-decap-oauth` on the `kulkarni-aditya12.workers.dev` subdomain, with `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, and `OAUTH_STATE_SECRET` set as Worker secrets.)*
3. **Point the CMS at the proxy.** Purpose: update `config.yml` with the proxy's `base_url`/`auth_endpoint`. *(Done — `base_url` set to the real Worker URL and merged to `main`.)*
4. **Confirm `local_backend` behaviour is correct for both modes.** Purpose: make sure local testing still works without the local flag hijacking the production login. *(Confirmed: Decap only engages the local proxy when the CMS is loaded from `localhost`, so `local_backend: true` is inert in production — no code change needed, documented in `config.yml`.)*
5. **Add the author as a repo collaborator.** Purpose: Decap commits using the author's own OAuth token, so her GitHub account needs push access to this repo. *(Done — added via Settings → Collaborators, invite accepted.)*
6. **Walk a full publish cycle in production.** Purpose: log in at `/admin`, create a post, edit it, confirm the commit lands on `main` and the change appears on the live site after deploy — end-to-end proof, not component-level confidence. *(Done — verified with a real published poem.)*
7. **Write a short authoring guide for the author.** Purpose: a non-developer needs to know the URL, the login step, and what "wait for it to appear" means; without this the flow is technically working but practically unusable. *(Done — `AUTHORING.md`.)*

**Done when:** the author publishes a post start to finish without anyone else touching a terminal. ✅ Confirmed 2026-08-30.

---

## Phase 3 — One source of truth for content structure · Core · ✅ Done

**Functionality served:** the site's notion of "what categories exist" lives in one place, so adding or renaming one is a single edit rather than a hunt.

The `categories` array (id / name / label) was hand-duplicated across **four** pages — `HomePage.tsx`, `CategoryPage.tsx`, `PostPage.tsx`, and `AboutPage.tsx` — while `client/src/lib/content.ts` separately maintained its own `CATEGORY_LABELS` and `CATEGORY_DEFAULT_THUMBNAILS` maps: six places encoding the same fact. All six now read `client/src/lib/categories.ts`. Separately, `content.ts` supported an `instagram` category that no navigation, route, or CMS collection referenced, and whose content folder held only a `README.md` — resolved by the decision below.

**Decision (2026-08-30): the `instagram` category is removed, and social media stays a link out, never a feed pulled in.**

The audit found three unrelated half-built pieces, none of them working:

- The `instagram` category contributed **zero posts by construction** — its folder held only `README.md`, which the loader explicitly skips. It cost a glob, an `ALL_FILES` row, and a `CATEGORIES` entry whose `inNav: false` flag existed solely to describe this one broken case.
- `HomePage.tsx` hardcoded three carousel slides whose "View on Instagram →" buttons pointed at `instagram.com/p/example1..3` — placeholder URLs that 404.
- `Header.tsx` and `SocialMediaSection.tsx` each hand-maintained their own copy of the platform list, and every URL was a bare platform homepage. No real profile URL existed anywhere in the repo, so the header's *"Follow me on Instagram and YouTube"* dropped readers on Instagram's logged-out page.

Mirroring an actual Instagram feed was rejected on mission grounds. Every viable route violates a stated non-goal: the Graph API (Basic Display shut down Dec 2024) needs a Business account and 60-day token refresh — *"no server to babysit"*; third-party widgets add tracking cookies and a recurring bill — *"no analytics-driven growth loops"*; official post embeds ship ~1MB of Instagram JS plus an iframe per post and turn into broken grey boxes when a post is deleted. **Instagram is a destination for readers who find a poem here, not a data source for this site.**

A curated, author-owned highlights grid — image, caption and permalink stored in the repo via a Decap *file* collection, rendered as plain lazy `<img>` tags with no runtime fetch — remains the only sustainable way to put Instagram content on-page. It is deliberately **not** scheduled: it must follow Phase 6 (otherwise every highlight is a multi-megabyte phone upload, re-creating the exact problem Phase 6 exists to fix), and it is only worth building if the author will reliably keep it current. A stale grid reads worse than no grid.

**Tasks**

1. **Decide the `instagram` category's fate.** *(Done — removed; see the decision above.)*
2. **Create the shared category module.** Purpose: one exported definition — id, display name, Devanagari label, default thumbnail — that both the UI and `content.ts` consume. *(Done — `client/src/lib/categories.ts`.)*
3. **Migrate the four pages to import it.** *(Done — `HomePage`, `CategoryPage`, `PostPage`, and `AboutPage` all import `CATEGORIES`.)*
4. **Migrate `content.ts` to it.** *(Done — `CATEGORY_LABELS` and `CATEGORY_DEFAULT_THUMBNAILS` folded into the shared definition, read via `getCategory()`.)*
5. **Act on the Phase-3-task-1 decision.** *(Done — dropped the `instagram` glob and `ALL_FILES` row from `content.ts`, the `CATEGORIES` entry, and the `client/src/content/instagram/` folder. With no `false` case left, `inNav` and `NAV_CATEGORIES` were removed too and the five call sites now import `CATEGORIES` directly.)*
6. **Give social links the same treatment.** Purpose: the platform list was duplicated across `Header.tsx` and `SocialMediaSection.tsx` — the same drift problem, one file over. *(Done — `client/src/lib/social.ts` is the single source; both components render from it.)*
7. **Stop the carousel promising posts that don't exist.** Purpose: a reader-visible 404 undercuts the mission's "beautiful, dignified" standard. *(Done — the `instagramLink` field is gone from `HeroCarousel.tsx` and both slide lists; the carousel is now visual-only. Repointing it at real `/post/<slug>` links, or driving it from the latest posts, is a reasonable future improvement.)*

**Done when:** adding a category is one file edit, and `grep` for a category label returns one definition. ✅ `npm run check` and `npm run build` both pass.

**Carried forward:** the three `url` values in `client/src/lib/social.ts` are still platform homepages rather than the author's real profiles, and the entry for any platform she doesn't actually use should be deleted. Both are now a one-line edit each in that one file — but until they're made, the social links remain cosmetic.

---

## Phase 4 — Working search and tag browsing · Core · ✅ Done

**Functionality served:** a reader can find a piece by searching or by following a tag, and every control in the UI leads somewhere real.

`HomePage`, `CategoryPage`, `PostPage`, and `AboutPage` all navigated to `/search?q=…`, and the first three also to `/tag/:tag` — **neither route existed in `App.tsx`**, so both 404'd. Both are now built, on the decision that a small in-memory corpus makes client-side search essentially free.

**Tasks**

1. **Decide: build or remove.** *(Done — built. The whole corpus is already in the bundle, so search is a filter over an array with no index to maintain.)*
2. **Add the `/search` route and results page.** *(Done — `SearchPage.tsx`, backed by `client/src/lib/search.ts`.)*
3. **Add the `/tag/:tag` route and listing page.** *(Done — `TagPage.tsx`, reusing the same listing body as the category page.)*
4. **Handle the empty and missing cases.** *(Done — three distinct states: a no-query prompt on bare `/search`, a no-results state that offers popular tags, and an unknown-tag state that lists every tag in use. All three offer a route back rather than dead-ending.)*
5. **Make the tag affordance consistent.** *(Done — `TagPill` is now a real `<Link>` rather than a component taking an `onClick` each page had to remember to pass. Every tag on the site navigates by construction, and readers can middle-click or copy a tag URL.)*

**Notes on how it was built**

- **Devanagari matching is explicit, not incidental.** `normalizeText()` in `search.ts` applies `.normalize('NFC')` before comparing, because the same visible grapheme can be stored precomposed or as base letter + combining mark depending on whether text came from the CMS, a phone keyboard, or a paste. Without it, a visually identical query silently fails to match. `toLowerCase()` is a no-op for Devanagari (unicameral) but still matters for the Latin text alongside it.
- **Search covers the transliterated slug and the Latin category id**, not just the Devanagari fields. Every post is written in Devanagari, but readers on a phone without a Marathi keyboard can now find "प्रेमाची भावना" by typing `premaachi`, and the ukhane collection by typing `ukhane`. Verified both.
- **Route params are decoded defensively.** wouter runs `decodeURI` over the path, which restores Devanagari but deliberately leaves reserved characters (`%2F`, `%26`) encoded; `decodeRouteParam()` finishes the job and falls back to the raw value on a malformed escape rather than throwing a render error.
- **Incidental cleanups the two new pages made worth doing.** `Header` now reads `CATEGORIES` and performs its own search navigation instead of taking `categories` and `onSearch` props from all six pages; its search box syncs to the URL, so `/search?q=…` shows the query after a refresh or a shared link. A shared `PostGrid` (grid + pagination + empty state) and `SiteFooter` replaced four hand-copied versions of each — the reason task 3 could reuse the category layout instead of copying it a third time.

**Done when:** searching from the header and clicking any tag both land on a working page, in Devanagari and Latin alike. ✅ Verified in the browser against the live dev server: Devanagari search (`प्रेम` → 3 results), Latin search (`ukhane`, `premaachi` → 1 result each), tag navigation by click (`नृत्य` → `कला`), all three empty states, and search-box prefill. `npm run check` and `npm run build` pass; the console is clean.

---

## Phase 5 — Per-post share previews · Core · ✅ Done

**Functionality served:** when a reader shares a poem to WhatsApp or Facebook, the preview shows *that poem* — its title, its excerpt, its image.

`PostPage` offered Facebook, Twitter, and WhatsApp share buttons, but `client/index.html` carried a single static `og:title` and `og:description` for the entire site, with no `og:image` and no `og:url` at all. Every shared link previewed as the generic homepage — contradicting "share it in a way that actually represents that poem" in `mission.md`.

**Tasks**

1. **Add per-route document metadata.** *(Done — `client/src/hooks/use-document-meta.ts`. Applied to all six routes, not just the post route: without this, `document.title` never changed across client-side navigation at all, since wouter routes without a page reload — a real, separate bug this closes as a side effect.)*
2. **Feed post frontmatter into the tags.** *(Done — `PostPage.tsx` passes `title`, `excerpt`, `thumbnail`, `type: 'article'`, `publishedTime`, and `postUrl(post.id)` into the hook, which sets `og:*`, `twitter:*`, and `<link rel="canonical">`.)*
3. **Fill in the site-level defaults.** *(Done — `client/index.html` now carries `og:site_name`, `og:image`, `og:url`, the `twitter:*` equivalents, and a canonical link, for every route that isn't a post.)*
4. **Address the crawler limitation.** *(Done — `scripts/prerender-posts.ts`, run after `vite build`. Scrapers don't execute JS, so `useDocumentMeta`'s DOM updates are invisible to them; this script bakes the same values into a real static file per post — `dist/public/post/<slug>/index.html` — by cloning the built `index.html` and substituting meta tag values via targeted string replacement, no DOM/HTML parser dependency. Reachable at `/post/<slug>` because GitHub Pages 301-redirects that (no trailing slash) to `/post/<slug>/`, then serves its `index.html` — confirmed against GitHub Pages' documented directory-index behaviour, the same mechanism Jekyll/Hugo rely on for pretty URLs. `postUrl()` already returns the trailing-slash form, so the canonical/og:url values never depend on that redirect actually firing.)*
5. **Verify with a real scraper.** *(Done — confirmed on the live production URL via a real social preview debugger. 2026-08-30.)*

**Incidental fix:** deriving a post's `excerpt` when no frontmatter `excerpt` exists (`client/src/lib/posts.ts`) preserved raw newlines from the markdown body. Harmless in a CSS-wrapped card, but it landed literally inside a meta tag's `content="..."` attribute once excerpts started being used for share previews. Now collapsed to single spaces regardless of source (frontmatter or derived) — also a small quality improvement to how excerpts render on cards.

**Done when:** pasting a post URL into WhatsApp shows that post's title and image. ✅ Confirmed both mechanically (local build inspection) and with a real scraper against the live site.

---

## Phase 6 — Lighter pages · Polish · ✅ Done

**Functionality served:** the site loads fast on a phone and stays cheap to host, even as the author keeps adding images.

`client/public/blog-images/` held six PNGs between 1.3MB and 2.0MB each — roughly 9MB for what are used as thumbnails. Decap's media widget uploads straight into that folder at whatever size and format the author's phone produces, so this recurs on its own unless the intake path changes too.

**A live bug turned up while starting this phase.** Two posts were deleted through Decap between Phase 5/7 landing and this phase starting. Git doesn't track empty directories, so that also broke the build (fixed separately — see the `fix/prerender-missing-category-dir` note above) — but it also silently deleted `poetry_calligraphy_thumbnail.png` and `articles_nature_thumbnail.png` from `client/public/blog-images/` via Decap's media library, without updating `categories.ts`'s `defaultThumbnail` values that pointed at them. Nothing currently visible was broken only because the one surviving poetry post specifies its own thumbnail — the next poem or article added without one would have rendered a broken image. Restoring those two files (from the still-intact `attached_assets/` copies) was folded into this phase's de-duplication work rather than handled as a separate fix, since resolving the duplication required deciding which copy survives regardless.

**Tasks**

1. **De-duplicate the two image folders.** *(Done. `client/public/blog-images/` is the one home — it's Decap's configured `public_folder`, so content can only ever reference paths there; that constraint decided the direction. `HomePage.tsx` and `AboutPage.tsx` (previously the only real consumers of `attached_assets/generated_images/`, via `@assets/*` Vite imports) now reference `/blog-images/*` through `resolveAssetPath()` — the same function and convention post thumbnails already use. `client/src/components/examples/` — confirmed unreferenced by `App.tsx` or any real page, Replit-scaffold leftovers — was deleted; it was the only other thing pointing at `attached_assets/generated_images/`, which is now gone entirely.)*
2. **Compress the existing images.** *(Done — `scripts/optimize-images.ts`, added with `sharp` as a devDependency. Recompresses in place, same filename and same extension, deliberately: converting to WebP was considered but rejected — every reference to these files (post frontmatter, `categories.ts`'s defaults, the homepage's hardcoded images) is a plain string with an extension, and renaming on the way out would mean either silently rewriting authored content or breaking references. Lossy PNG (palette mode, `sharp`'s `{ palette: true }`) achieves most of the same size win without that tradeoff. Capped at 1600px on the long edge. All 6 images: **1.3–2.0MB → 330–580KB, a 71–77% reduction**, visually verified at native size including a face/portrait shot (the most artifact-sensitive case). Total site payload (`dist/public/`) dropped from the images alone contributing ~9.7MB duplicated to **3.2MB total, zero duplication**.)*
3. **Fix the intake path.** *(Done, the automatic option. The same `optimize-images.ts` runs again as a build step — `npm run build` and `.github/workflows/deploy.yml` both call it against `dist/public/blog-images` after `vite build` — so a raw multi-MB phone photo uploaded through Decap gets compressed before a reader ever sees it, with nothing for the author to do. A real risk surfaced in testing: since the *source* images are now already well-compressed, an early version of this script would have re-compressed them on every single future build — a lossy pass on top of a lossy pass, forever, for no size benefit, since the "already reasonably sized" skip threshold (300KB) sat below what this script's own output actually looks like (330–580KB). Raised to 700KB and verified idempotent: a second pass over already-optimized output now changes nothing, while a simulated ~2MB raw upload still gets caught and compressed correctly.)*

**Done when:** no image in `blog-images/` is over a few hundred KB, the same file isn't stored in two places, and a new CMS upload doesn't reintroduce a multi-megabyte file. ✅ All three confirmed: largest current image is 580KB (down from up to 2.0MB), `attached_assets/generated_images/` no longer exists, and the build-time step is verified to catch a raw upload while leaving already-optimized images untouched. `npm run check` and `npm run build` pass; browser-verified — homepage carousel, About portrait, and the previously-broken `articles` category default thumbnail all render correctly, console clean.

---

## Phase 7 — Reader conveniences · Polish · ✅ Done

**Functionality served:** two small things readers expect, both already backed by data the site has.

Built together with Phase 5 — both turned out to need the same underlying move: a build-time script that can parse posts outside the browser. `client/src/lib/content.ts`'s post-parsing logic was extracted into environment-agnostic `client/src/lib/posts.ts` (no `import.meta.glob`, no `import.meta.env`) so both a plain Node script and the Vite-bundled site call exactly one implementation — the same drift Phase 3 eliminated for category labels was just as possible here between the site and a feed generator that parsed posts independently.

**Tasks**

1. **Show a reading-time estimate.** *(Done — `client/src/lib/reading-time.ts`, shown on `PostPage.tsx`'s metadata bar next to the date, matching `design_guidelines.md`'s spec. Counts words via `Intl.Segmenter('mr', { granularity: 'word' })` rather than a naive `\w+`/`\b`-based regex — `\w` in JS only matches `[A-Za-z0-9_]`, so that class of approach silently undercounts Devanagari text to near zero; a plain whitespace split is the fallback for a browser old enough to lack `Intl.Segmenter`. 150 words/minute, documented as an approximation — there's no authoritative Marathi-specific reading-speed figure to use instead.)*
2. **Generate an RSS feed.** *(Done — `scripts/generate-rss.ts`, run after `vite build`, writes `dist/public/rss.xml`. Standard RSS 2.0, one `<item>` per post with `<title>`/`<link>`/`<guid>`/`<pubDate>`/`<category>`/`<description>` (the excerpt, not the full body — see note below). Locally verified as well-formed XML with all 7 current posts present, in published-date order.)*
3. **Link the feed from the site.** *(Done — `<link rel="alternate" type="application/rss+xml">` in `client/index.html` for feed-reader auto-discovery, plus a visible "RSS Feed" entry point in `SiteFooter.tsx` (every page) so it isn't only discoverable by tooling.)*

**Deliberately out of scope:** `<description>` carries the excerpt, not full post content via `<content:encoded>`. Rendering the current plain-paragraph Markdown as correct feed HTML would need a real Markdown→HTML pass — the underlying `remark`/`rehype` toolchain exists only as a transitive dependency of `react-markdown`, not a declared one, and building on it un-declared is a version-fragile foundation for a real feature. A full-text feed is a reasonable future enhancement if wanted; this is a correct, conventional summary feed instead of an incorrect full-text one.

**Done when:** a post shows its reading time, and a feed reader can subscribe to new work. ✅ Both verified locally — reading time confirmed in the browser (`भेट`, a short poem, correctly shows "1 मिनिट वाचन"); `rss.xml` confirmed well-formed with `python -m xml.dom.minidom`. `npm run check` and `npm run build` pass.

---

## Phase 8 — Prune unused scaffolding · Polish · ✅ Done

**Functionality served:** the repo reads as the static content site it actually is, so future work isn't spent tracing machinery nothing calls.

`server/routes.ts` (empty), `server/storage.ts` (unused `MemStorage`), `shared/schema.ts` + Drizzle, Passport, and `express-session` were all present with nothing calling them — no routes were registered, and there were no `useQuery`/`useMutation` calls anywhere in the client despite TanStack Query being wired up in `App.tsx`.

**Tasks**

1. **Remove the dead server modules.** *(Done. `server/routes.ts` and `server/storage.ts` deleted. `routes.ts`'s only real function — `registerRoutes()` — did nothing but `createServer(app)`; `app.ts` now calls that directly, so nothing about the dev server's actual behavior changed.)*
2. **Remove the database layer.** *(Done. `shared/schema.ts` and `drizzle.config.ts` deleted, along with the `shared/` directory itself — `schema.ts` was its only file, and `storage.ts` (also deleted) was its only consumer, so the `@shared/*` path alias in `tsconfig.json` and `vite.config.ts` came out too. Dropped `drizzle-orm`, `drizzle-zod`, `drizzle-kit`, `@neondatabase/serverless`, and the `db:push` script.)*
3. **Remove the auth dependencies.** *(Done. Dropped `passport`, `passport-local`, `express-session`, `connect-pg-simple`, `memorystore`, and their `@types/*` packages — grepped first to confirm zero imports anywhere in `client`/`server`/`shared` before removing any of them.)*
4. **Re-evaluate TanStack Query.** *(Done — removed. No concrete use was in view; `App.tsx` only ever imported `QueryClientProvider` to wrap the tree, never `useQuery`/`useMutation`. Removing `client/src/lib/queryClient.ts` and the provider also shrank the client JS bundle by ~27KB — a real, if incidental, page-weight win.)*
5. **Update the docs.** *(Done — `CLAUDE.md`'s server section and `spec/tech-stack.md`'s former "Backend (present, not load-bearing)" section both rewritten to describe what's actually left, not what used to be there.)*
6. **Audit the shadcn/ui-adjacent packages left untouched above.** *(Done — added 2026-08-31, after the phase first shipped. See below.)*

**Two mechanical follow-ons, not separately scoped tasks but direct consequences of the above:** `zod` and `zod-validation-error` (only import was `shared/schema.ts`, now gone) and `ws` + the `bufferutil` optional dependency (only reason either existed was `@neondatabase/serverless`'s WebSocket driver, also now gone) were removed too — leaving either in place would have meant "pruning" the exact subsystem that made them necessary while still shipping their orphaned remains.

**Task 6, added after the fact: auditing what task 5's first pass deliberately left untouched.** The original version of this phase explicitly declined to audit `react-hook-form`, `@hookform/resolvers`, `cmdk`, `embla-carousel-react`, `recharts`, `vaul`, `input-otp`, `react-day-picker`, `react-resizable-panels`, and the full `client/src/components/ui/*` primitive set (~47 files) — reasonably, at the time, since it's a materially different, larger task than the rest of the phase's named scope. A follow-up request asked for exactly that audit. The result: **only 4 of 47 shadcn primitives were reachable from any real page or component — `badge`, `button`, `card`, `input`.** Two components initially assumed "live" because they're wired into `App.tsx` turned out to be dead the same way TanStack Query was:
- `toast`/`toaster` — `<Toaster />` renders in `App.tsx`, but `toast()` is never called anywhere in the app.
- `tooltip` — `<TooltipProvider>` wraps the entire tree, but an actual `<Tooltip>` is only ever used inside `chart.tsx` and `sidebar.tsx` — both themselves unreachable.

Deleted: 43 of 47 `client/src/components/ui/*.tsx` files, the two hooks whose only consumers were among them (`use-toast.ts`, `use-mobile.tsx`), the `<TooltipProvider>`/`<Toaster>` wiring in `App.tsx`, and every npm package whose only consumer was one of those files — 27 `@radix-ui/*` packages, `cmdk`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-hook-form`, `react-resizable-panels`, `recharts`, `vaul`, `@hookform/resolvers` (confirmed zero usage independent of this, even before the ui-file audit).

The same sweep also caught three things that aren't shadcn primitives but are the identical pattern — confirmed genuinely unused, not merely "not part of this audit":
- `tailwindcss-animate` — its `animate-in`/`animate-out`/`data-[state=]` utility classes were used only inside files just deleted (`toast.tsx`, `tooltip.tsx`, and others); removed from `tailwind.config.ts`'s `plugins`, along with the `accordion-down`/`accordion-up` keyframes that existed solely for the now-deleted `accordion.tsx`.
- `@tailwindcss/vite` — a Tailwind v4 Vite plugin that was never actually wired into `vite.config.ts`; this project uses classic PostCSS (`postcss.config.js`) with Tailwind CSS 3.
- `date-fns`, `next-themes`, `framer-motion` — zero usage anywhere in `client/src`, independent of any shadcn file. `framer-motion` in particular contradicted `CLAUDE.md`'s own prior description of it as powering "card hover, transitions" — that description was simply stale.

**Result:** the production CSS bundle dropped from 92.56KB to 47.07KB (nearly half), and the JS bundle dropped a further ~58KB on top of task 4's ~27KB TanStack Query win.

**Still deliberately not touched:** `components.json` (the shadcn CLI config) is kept — it costs nothing to keep and remains genuinely useful if a real future need justifies re-adding a specific primitive via `npx shadcn add`. The `@replit/vite-plugin-*` devDependencies and CSS custom properties for now-unused design tokens (`--chart-*`, `--sidebar-*` in `index.css`) were also left alone — cleaning up inert CSS variables and Replit-scaffold dev tooling is a different, smaller-stakes question than "is this JS actually shipped to a reader," and wasn't part of what was asked.

**Incidental fix, unrelated to the pruning itself:** `tsconfig.json`'s `include` never covered `scripts/` (added across Phases 5–7), so `npm run check` had never actually type-checked the build scripts — only running them would have caught a type error. Added `scripts/**/*` to `include` while touching this file for the `shared/**/*` removal anyway.

**Done when:** `npm run check` passes, the site builds and deploys unchanged, and nothing in the repo describes machinery that isn't there. ✅ `npm run check` and `npm run build` both pass; `npm run dev` smoke-tested after the `server/app.ts` change (dev server boots, site renders, console clean); the GitHub Pages deploy is unaffected either way, since it never ran this server. Re-verified after task 6: browser-tested across the homepage, search, and a post page (confirming `badge`/`button`/`card`/`input` all render correctly on the smaller CSS bundle), console clean.

---

## Phase 9 — Chronological archive view · Polish · ✅ Done

**Functionality served:** a reader can browse the site the way `mission.md` itself describes it — *"a personal creative archive"* — by date, not only through the single flat newest-first feed on the homepage.

Before this phase there was exactly one way to browse without already knowing what you want: `HomePage.tsx`'s single paginated grid. Phase 4's `/search` and `/tag/:tag` were destinations, not discovery surfaces — reachable only after clicking a pill on a post already open, or as a fallback on an *empty* `/search`.

**Note:** this phase, Phase 10 (sitewide "latest" block), and Phase 11 (tag-filter block) were originally scoped and shipped as one combined phase, "Archive, latest, and tag-filter blocks." They're split apart here because they're three independently shippable pieces of functionality — none depends on the others — that happened to be built in the same pass. The shared placement decision below (task 1) covers all three; it's repeated in each phase's own words for that reason.

**Tasks**

1. **Decide where the archive view lives.** *(Done. A new dedicated `/archive` route, reusing the existing `ContentCard` grid under year headings rather than inventing a new visual pattern — no sidebar was introduced anywhere, since no page on the site uses one and `design_guidelines.md` doesn't define one.)*
2. **Add a chronological archive/timeline view.** *(Done — `ArchivePage.tsx` at `/archive`, grouping `getAllPosts()` by year, newest year first, reusing `ContentCard` in the same grid every other listing page uses. Grouped by year only, not year-and-month as originally scoped — the current post volume doesn't yet justify a second grouping level, and adding one later is a small, isolated change to `groupByYear()` if it ever does. Linked from the nav — originally added right after Home in `Header.tsx`, both desktop and mobile; **relocated in Phase 13** to sit beside the search box instead, and relabeled "ब्लॉग संग्रह" — and from a "View the full archive" link under the homepage's tag cloud.)*
3. **Keep it data-only.** *(Done — a pure derivation of `getAllPosts()`. No new dependency, no runtime fetch.)*

**Done when:** a reader can reach any post by date, through a link that's visible, not a URL someone has to already know. ✅ Verified in the browser: the Archive page groups correctly and updates its tab title. `npm run check` and `npm run build` pass; console clean.

---

## Phase 10 — Sitewide "latest" block · Polish · ✅ Done

**Functionality served:** from any post, a reader can see what's newest across the whole site — not just other posts in the same category.

Before this phase, `PostPage.tsx`'s only "what else might you like" surface was "More from {category}," which never shows a reader anything outside the category they're already reading.

**Note:** this phase, Phase 9 (chronological archive view), and Phase 11 (tag-filter block) were originally scoped and shipped as one combined phase, "Archive, latest, and tag-filter blocks." They're split apart here because they're three independently shippable pieces of functionality — none depends on the others — that happened to be built in the same pass.

**Tasks**

1. **Decide where the latest block lives.** *(Done — `PostPage` only, not the homepage: Home's existing feed is already sorted newest-first, so a second "latest" teaser there would be redundant with itself; `PostPage`'s existing "More from {category}" section only ever suggests same-category posts, so a sitewide "newest everywhere" strip there is genuinely new value, not a duplicate.)*
2. **Add a reusable "Latest" block.** *(Done — `LatestPosts.tsx`, parameterized by `count` and an `excludeId` so a post's own page can show "what's new" without listing itself. Placed on `PostPage`, matching the existing "More from {category}" section's exact grid — same narrow `max-w-3xl` container, so a different column count there would have read as visually inconsistent on the one page it appears on.)*
3. **Keep it data-only.** *(Done — a pure derivation of `getAllPosts()`. No new dependency, no runtime fetch.)*

**Done when:** a reader on any post page can see what's newest sitewide, excluding the post they're already on. ✅ Verified in the browser: `PostPage`'s "Latest Everywhere" strip correctly excludes the post it's shown on. `npm run check` and `npm run build` pass; console clean.

---

## Phase 11 — Tag-filter block (tag cloud) · Polish · ✅ Done

**Functionality served:** a reader gets an at-a-glance sense of what she writes about most, and a one-click way to browse by theme, right from the homepage — not only after opening a post and clicking one of its tags.

`design_guidelines.md` already specified a `flex flex-wrap gap-3` "Tag Cloud" grid that had never actually been built as a browsable surface.

**Note:** this phase, Phase 9 (chronological archive view), and Phase 10 (sitewide "latest" block) were originally scoped and shipped as one combined phase, "Archive, latest, and tag-filter blocks." They're split apart here because they're three independently shippable pieces of functionality — none depends on the others — that happened to be built in the same pass. This is the one of the three that actually depends on prior work: Phase 4's tag plumbing (`getAllTags()`, `/tag/:tag`).

**Tasks**

1. **Decide where the tag cloud lives.** *(Done — the homepage, the site's highest-traffic entry point.)*
2. **Add a visible tag-filter block.** *(Done — `TagCloud.tsx` on the homepage. Originally a genuine weighted cloud, not a flat pill list: font size scaled across four buckets by each tag's share of `getAllTags()`'s count range, visually distinct from the uniform pill lists on `TagPage`/`SearchPage`. **Superseded in Phase 13**: with the current small post corpus, the weighting produced a stark two-level jump rather than a smooth gradient, so it now renders the same uniform `TagPill` as those other pages. Every tag links into the existing `/tag/:tag` route.)*
3. **Keep it data-only.** *(Done — a pure derivation of `getAllTags()`. No new dependency, no runtime fetch.)*

**Done when:** a reader can see which tags are used most, and reach any tag's posts in one click, from the homepage. ✅ Verified in the browser: tag cloud → `/tag/<tag>` navigation confirmed by click. `npm run check` and `npm run build` pass; console clean.

---

## Phase 12 — Content-driven hero carousel · Polish · ✅ Done

**Functionality served:** the homepage hero becomes a real discovery surface — each slide links to an actual post — instead of three fixed decorative images that lead nowhere.

Phase 3 stripped the carousel's "View on Instagram →" links because they pointed at placeholder URLs that 404'd, leaving `HomePage.tsx`'s `carouselSlides` as a hardcoded, non-clickable array (see `HeroCarousel.tsx` — the slide images and captions carry no `<Link>`/`onClick` at all, only the prev/next arrows and dot indicators are interactive). That was the right call at the time — a dead link is worse than no link — but the carousel has stayed purely cosmetic ever since, duplicating no other section's *purpose* but also adding none of its own, right above `TagCloud` and `PostGrid`, which already do real discovery work.

**Tasks**

1. **Decide the selection and count.** *(Done — the 3 most recent posts from `getAllPosts()`, no new frontmatter field, no CMS change. A `featured: true` flag was considered and deferred: it would need a new Decap `config.yml` field, an authoring-guide update, and a decision for zero/many-flagged posts — not justified while "most recent" already surfaces her latest work, the same reasoning Phase 9/10 used to keep their blocks pure derivations of `getAllPosts()`.)*
2. **Wire slide data from posts, not a hardcoded array.** *(Done — `HomePage.tsx`'s `carouselSlides` is now built from `getAllPosts()`: image from `post.thumbnail` (already resolved by `parsePosts()`, no second `resolveAssetPath()` call needed), caption from `post.title`, and a link target of `` `/post/${post.id}` `` — the same relative path `ContentCard.tsx` already uses, not `postUrl()`, which builds a fully-qualified `https://...` URL for canonical/OG tags and would have forced a full page reload instead of client-side routing.)*
3. **Make `HeroCarousel` navigable.** *(Done — `Slide` now takes a required `href`; each slide's image, gradient overlay, and caption are wrapped in a `wouter` `<Link className="absolute inset-0 block">`, matching how `TagPill` became a real `<Link>` in Phase 4. Verified in the browser: the prev/next buttons and dot indicators, rendered as later siblings outside the `Link`, are unaffected — clicking "next" advances slides without navigating, confirmed via the URL/title staying on `/`.)*
4. **Handle sparse-content edge cases.** *(Done — no new component logic needed. The live site currently has exactly 2 posts; `getAllPosts().slice(0, 3)` naturally returns 2, `HeroCarousel`'s existing `slides.length === 0` → `null` and `slides.length <= 1` → no-autoplay guards cover the rest. Verified in the browser with the real 2-post corpus: both slides render, both indicator dots work, autoplay correctly does not fire the single-slide code path since there are 2.)*
5. **Address the duplicate-thumbnail case.** *(Done — added `getFeaturedPosts()` in `HomePage.tsx`: walks `getAllPosts()` and skips a post whose `thumbnail` string exactly matches the immediately-preceding selected slide's, pulling from further down the list instead; falls back to allowing a repeat rather than shrinking the carousel below `count` if there aren't enough posts with distinct thumbnails. Not exercised by the current 2-post corpus — both existing posts set their own distinct thumbnail — but in place before a third same-category, thumbnail-less post makes it live.)*
6. **Remove the now-dead hardcoded slide data.** *(Done — the fixed `carouselSlides` array and its Phase-3-era "visual-only" comment are gone from `HomePage.tsx`. Confirmed `HeroCarousel`'s `slides` prop has exactly one consumer.)*
7. **Verify.** *(Done — `npm run check` and `npm run build` both pass. Browser-verified against the live dev server: clicking a slide (both the wedding-thumbnail slide and the poetry-thumbnail slide) opens that exact post — confirmed via URL, tab title, and full rendered post content, not just a route change; the "next" arrow switches slides without navigating; console clean throughout.)*

**Done when:** the homepage hero shows real posts, clicking (or tapping) a slide opens that post, and no hardcoded placeholder image data remains in `HomePage.tsx`. ✅ Confirmed 2026-09-10.

---

## Phase 13 — Repo/brand rename and scaffolding cleanup · Polish · ✅ Done

**Functionality served:** the repo name, live URL, on-page brand, and docs all agree on one identity, and the codebase no longer carries dead Replit-only tooling alongside the one piece of it that's actually still useful.

**Tasks**

1. **Rename the repo and its production URL.** *(Done — `prajaktacreations11/marathi-bytes` → `prajaktacreations11/prajakta-prabha`, live at `https://prajaktacreations11.github.io/prajakta-prabha/`. Updated every hardcoded coupling to the old name: `vite.config.ts`'s production `base`, `seo.ts`'s `SITE_BASE_PATH`, `client/index.html`'s OG/canonical/RSS tags, `client/public/admin/config.yml`'s Decap `backend.repo`, `404.html`'s SPA-redirect comment, the local git `origin` remote, and every doc that named the old repo/URL. The actual GitHub-side rename is a manual step outside this codebase — no `gh` CLI or credentials were available to do it directly.)*
2. **Update the English brand name.** *(Done — `MarathiBytes` → `प्राजक्तप्रभा` in `README.md`'s title, `spec/mission.md`'s opening line, the Decap admin page `<title>`, and `oauth-proxy/README.md`'s suggested OAuth App name. Left `spec/spec.md`'s Phase 2 record of the *already-registered* OAuth App name (`MarathiBytes CMS`) alone — that's a historical fact about what's live on GitHub today, not a to-do; renaming the actual OAuth App is a separate manual step this codebase can't perform.)*
3. **Remove the remaining Replit scaffolding.** *(Done — the deferred half of Phase 8's "still deliberately not touched" note. Deleted `.replit` and the `cartographer`/`dev-banner` Vite plugins from `vite.config.ts`, along with their two now-unused devDependencies — both were gated behind `REPL_ID`, so they never actually ran outside a Replit container; pure dead code. Kept `@replit/vite-plugin-runtime-error-modal`: unlike the other two it's unconditional and provides a real dev-time error overlay in any environment, Replit or not, so removing it would have cost working functionality rather than dead weight.)*
4. **Simplify the tag cloud to uniform tags.** *(Done — reverses part of Phase 11's decision. The weighted-by-frequency sizing looked correct in concept but, against the site's current small post corpus, produced a stark two-tag bold/large-vs-everything-else-small split rather than a smooth gradient. `TagCloud.tsx` now renders the same `TagPill` component `TagPage`/`SearchPage` already use — visually identical to those pages now, just a different subset of tags.)*
5. **Relocate and relabel the archive nav link.** *(Done — "संग्रह" moved out of the main category nav row (added in Phase 9) to sit directly beside the search box, in both the desktop header and the mobile menu, and relabeled "ब्लॉग संग्रह". Still the same `/archive` route from Phase 9, unchanged.)*
6. **Replace the stale favicon.** *(Done — `client/public/favicon.png` was still the default Replit logo left over from the original scaffold; replaced with the site's own image. The only reference to it (`client/index.html`'s `<link rel="icon">`) needed no change.)*

**Done when:** `npm run check` and `npm run build` both pass, the built output's asset paths and meta tags resolve under the new repo name, and no page or doc still shows Replit's placeholder branding. ✅ Confirmed — `npm run check` and `npm run build` pass after each task; built `dist/public/index.html` verified to carry the new base path and OG/canonical URLs; browser-verified in the dev server that the tag cloud renders uniformly and the archive link sits next to search.

---

## Explicitly out of scope

Per `mission.md`'s non-goals: multi-author support, comments, monetization or ads, and turning this into a general-purpose CMS product are not on this roadmap. If any of these becomes genuinely needed, that starts as a mission-level conversation, not a spec addition.
