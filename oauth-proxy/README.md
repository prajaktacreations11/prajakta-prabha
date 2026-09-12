# Decap CMS OAuth proxy

A small Cloudflare Worker that lets Decap CMS (`/admin` on the live site) authenticate
against GitHub in production. Decap's `github` backend can't call GitHub's OAuth
token endpoint directly from the browser — that would expose the client secret — so
it expects a tiny server-side proxy at two routes, which is what this is:

- `GET /auth` — redirects the author to GitHub's login/consent screen
- `GET /callback` — exchanges the code GitHub returns for an access token, then hands
  it back to the `/admin` tab via `postMessage`

This is the one piece of the project that isn't static hosting, because a client
secret has to live somewhere the browser can't read it.

## One-time setup

### 1. Create the GitHub OAuth App

In the GitHub account that owns the repo (`prajaktacreations11`):

1. Go to **Settings → Developer settings → OAuth Apps → New OAuth App**
   (direct link: https://github.com/settings/applications/new)
2. Fill in:
   - **Application name**: `MarathiBytes CMS` (anything recognizable)
   - **Homepage URL**: `https://prajaktacreations11.github.io/prajakta-prabha/`
   - **Authorization callback URL**: `https://<your-worker-subdomain>.workers.dev/callback`
     (you'll get the real `workers.dev` URL after the first `wrangler deploy` in step 2 —
     deploy once to see it, then come back and fill in this field, or add a custom
     domain to the Worker first if you'd rather set this once.)
3. Click **Register application**.
4. Copy the **Client ID**, then click **Generate a new client secret** and copy that too.
   The secret is shown once — if you lose it, generate a new one.

### 2. Deploy the Worker

You'll need a free Cloudflare account (https://dash.cloudflare.com/sign-up).

```
cd oauth-proxy
npm install
npx wrangler login          # opens a browser to authorize wrangler
npx wrangler deploy         # first deploy — note the printed workers.dev URL
```

Then set the three secrets (you'll be prompted to paste each value):

```
npx wrangler secret put GITHUB_OAUTH_CLIENT_ID
npx wrangler secret put GITHUB_OAUTH_CLIENT_SECRET
npx wrangler secret put OAUTH_STATE_SECRET
```

`OAUTH_STATE_SECRET` isn't from GitHub — it's a random string only this Worker uses
to sign the CSRF-protection token. Generate one yourself, e.g.:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Redeploy after setting secrets so they take effect:

```
npx wrangler deploy
```

### 3. Wire up the two things that reference each other

- Go back to the GitHub OAuth App (step 1) and make sure **Authorization callback URL**
  is exactly `https://<your-worker-subdomain>.workers.dev/callback`.
- In `client/public/admin/config.yml`, set `base_url` to
  `https://<your-worker-subdomain>.workers.dev` (see the comment there).

### 4. Give the author write access to the repo

Decap commits on the author's behalf using *her own* GitHub OAuth token, so her
GitHub account needs push access to this repo:

**Settings → Collaborators → Add people** → invite her GitHub account (the one tied
to her dedicated Gmail) → she accepts the emailed invite.

## Local development

`npx wrangler dev` runs the Worker locally, but you won't normally need this — for
local CMS testing, `local_backend: true` in `config.yml` plus `npx decap-server`
(see the root `CLAUDE.md`) bypasses this Worker entirely and needs no GitHub OAuth
App at all.

## Redeploying

Any time `src/index.ts` changes: `cd oauth-proxy && npx wrangler deploy`. This isn't
wired into the GitHub Actions workflow (that only builds/deploys the client site) —
redeploy the Worker manually when you touch it.
