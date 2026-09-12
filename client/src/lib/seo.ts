/**
 * Site-wide constants for building absolute URLs — used both by the browser
 * (the `useDocumentMeta` hook) and by the Node build scripts (`scripts/`)
 * that generate per-post static HTML and the RSS feed. Kept dependency-free
 * (no `import.meta.env`) so it works in both environments unchanged.
 */

/** Must match `spec/tech-stack.md`'s recorded hosting decision (Phase 1). */
export const SITE_ORIGIN = 'https://prajaktacreations11.github.io';

/**
 * Must match `base` in vite.config.ts's production branch. Not derived from
 * it automatically — vite.config.ts pulls in Vite/Replit-only imports that
 * don't belong in a plain Node script — so if one changes, so must the other.
 */
export const SITE_BASE_PATH = '/prajakta-prabha/';

export const SITE_URL = SITE_ORIGIN + SITE_BASE_PATH;

export const SITE_NAME = 'प्राजक्तप्रभा';

/**
 * The image used as the OG/Twitter preview for pages that aren't a specific
 * post (home, category, search, tag, about) and as the fallback for a post
 * with no thumbnail of its own. Root-relative to the public folder, matching
 * how post thumbnails are already authored.
 */
export const DEFAULT_OG_IMAGE = '/blog-images/about_section_portrait.png';

/** Turns a root-relative, already-base-rebased path into a fully-qualified URL. */
export function absoluteUrl(rootRelativePath: string): string {
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(rootRelativePath)) return rootRelativePath;
  return SITE_ORIGIN + '/' + rootRelativePath.replace(/^\//, '');
}

/** Canonical URL for a post — trailing slash, matching the prerendered directory. */
export function postUrl(id: string): string {
  return `${SITE_URL}post/${encodeURIComponent(id)}/`;
}

/**
 * OG/Twitter descriptions render badly past a couple of lines, and unlike
 * every other excerpt display on the site (which relies on CSS line-clamp),
 * a share-preview card has no clipping of its own — a non-technical author
 * pasting a long excerpt into Decap's plain `text` widget would otherwise
 * ship a broken-looking card with no warning.
 */
export function truncate(text: string, max = 200): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1).trimEnd() + '…';
}
