# Vercel deploy — Matmoora web

Deploy path for the Next.js frontend. Vercel's Hobby tier covers it indefinitely at the project's expected traffic.

## First deploy (fixture mode — no backend needed)

1. Push `claude/start-project-build-ccKA5` to GitHub (once the Claude GitHub App is installed on the repo).
2. On Vercel: **Add New → Project → Import `Majdiden/matmoora`**. Point the **Root Directory** at `matmoora-web`.
3. Framework preset auto-detects as **Next.js**.
4. Install command: `pnpm install --frozen-lockfile`
5. Build command: `pnpm build`
6. Add environment variables:

   | Scope | Variable | Value |
   |---|---|---|
   | Production + Preview + Development | `MATMOORA_FIXTURES` | `1` |
   | Production + Preview + Development | `NEXT_PUBLIC_MATMOORA_FIXTURES` | `1` |
   | Production + Preview + Development | `WORDPRESS_GRAPHQL_ENDPOINT` | `http://unused.local/graphql` |
   | Production | `NEXT_PUBLIC_ENV` | `production` |
   | Production | `NEXT_PUBLIC_SITE_URL` | the Vercel-provided URL for now |

7. Deploy. ~90 seconds later you have a public preview URL rendering the 7 documented investigations + full archive from fixtures.

## Switch to live mode (after Railway CMS is up)

Follow `docs/RAILWAY_DEPLOY.md` Phase 1–3 first, then in Vercel:

1. Remove `MATMOORA_FIXTURES` and `NEXT_PUBLIC_MATMOORA_FIXTURES` (or set to `0`).
2. Set the real `WORDPRESS_GRAPHQL_ENDPOINT`, `WP_BASE_URL`, `MEILI_HOST`, `MEILI_SEARCH_KEY`, `REVALIDATE_SECRET`, `PREVIEW_SECRET`.
3. Trigger a redeploy. The data layer in `lib/wp/data.ts` now talks to Railway.

## Preview deployments

Every PR gets a unique Vercel preview URL. Keep `MATMOORA_FIXTURES=1` set at the **Preview** scope only — this way PR previews never need the live CMS to render, which keeps review fast and insulates reviewers from editor-side changes in flight.

## Custom domain

1. Vercel → **Settings → Domains** → add `matmoora.org` (apex) and `www.matmoora.org`.
2. In Cloudflare (recommended registrar for free DNS): point `A` records at Vercel's apex IP and `CNAME www` to the Vercel domain. Keep the orange cloud **off** for `www` so Vercel can issue the certificate.
3. Add the Arabic subdomain or path-based routing if needed later — current config uses `/ar` and `/en` prefixes, no DNS work required for the languages.

## Smoke checklist after each deploy

- `GET /en` → 200, cards render
- `GET /ar` → 200, RTL layout, Arabic titles
- `GET /en/archive?type=publication` → 200, filtered to publications
- `GET /en/investigations/el-geneina-attack-2023` → 200
- `GET /api/health` → 200, `{ "status": "ok" }`
- Sentry picks up a synthetic error from `/api/health?boom=1` (if wired)
