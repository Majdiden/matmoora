# Matmoora — Build Progress

Running log of what's shipped and what's left. Mapped to `TECH_SPEC.md` and the Drive requirements doc.

---

## Shipped

### Brand system (Drive: Visual Identity)
- Palette wired as CSS variables + Tailwind v4 tokens: `#0d0d0d` ink, `#20234f` navy, `#f7e6d2` cream, `#e46427` orange.
- Fonts: Cairo (Arabic placeholder) + Poppins (English) via `next/font/google`. Licensed DIN Next Arabic swap procedure documented in `lib/fonts.ts`.
- Logo: SVG wordmark with the topographic-blob mark. When the licensed raster PNGs from Drive are placed in `public/brand/`, swap for `<Image>`.
- Topographic contour backdrop as inline SVG — no asset requests, both navy and cream variants (`bg-topographic-navy`, `bg-topographic`).

### Content model (TECH_SPEC §5 · requirements doc §3)
- `matmoora-content-model.php` mu-plugin registers 7 CPTs + 5 taxonomies, all WPGraphQL-exposed.
- Seven ACF JSON field groups cover every content type (`matmoora-cms/acf-json/`).
- `plugins.lock` tracks the planned WP plugin set.

### Pages (both languages, matching the Miro sketches with design system polish)
- `/[locale]` **Collections** — 3-column investigation grid.
- `/[locale]/investigations/[slug]` **Investigation detail** — snapshot table + numbered sections + related content + related investigations.
- `/[locale]/archive` **Archive** — URL-state-driven filter rail + full-width search + results.
- `/[locale]/archive/[slug]` **Archive piece page** — metadata table + content pane.
- `/[locale]/about` **About** — numbered document trail with topographic dividers + stat rail + distinct contact card.
- Shared `PageHeader`, `SectionMarker`, `TopoDivider`, `StatsBar`, `SectionIcon` so pages read as one family.

### Data layer
- `lib/wp/fixtures.ts` — the 7 investigations + 20+ pieces documented in the Drive materials.
- `lib/wp/data.ts` — single surface for pages; switches between fixtures and live WPGraphQL.
- `lib/wp/queries/investigations.ts` — GraphQL queries for the live mode.
- Toggle via `MATMOORA_FIXTURES=1` or by omitting `WORDPRESS_GRAPHQL_ENDPOINT`.

### Meilisearch indexer (TECH_SPEC §12)
- `matmoora-search.php` rewritten around the real CPTs with the Archive page's exact facets.
- WP-CLI: `wp matmoora search:settings`, `wp matmoora search:reindex`.
- Reads `MEILI_HOST`/`MEILI_MASTER_KEY` from env, so the same plugin works on Docker Compose and on Railway unchanged.

### Railway deploy stack (new)
- `matmoora-cms/Dockerfile` — WordPress + Apache image, Composer-managed plugins baked in.
- `matmoora-cms/composer.json` — public plugin set: WPGraphQL, Yoast, add-wpgraphql-seo, Akismet, Wordfence.
- `matmoora-cms/scripts/railway-entrypoint.sh` — normalises `MYSQL_URL` → wordpress env, waits for the DB, handles `$PORT`.
- `matmoora-cms/Meilisearch.Dockerfile` + `railway.meili.json` — Meili as a separate Railway service with a persistent volume.
- `matmoora-cms/railway.json` — healthcheck + start command for the WP service.
- `matmoora-web/railway.json` — Vercel is the first-class target but Railway is an option.
- `wp-content/themes/matmoora-stub/` — minimal theme that redirects any direct WP frontend hit back to the Next.js site.

### Docs
- `RAILWAY_DEPLOY.md` — step-by-step Railway + Vercel deploy, 5 phases, cost table, backups.
- `VERCEL_DEPLOY.md` — Vercel-specific config, preview env, custom domain.
- `HOSTING_OPTIONS.md` — Railway vs. Hetzner decision + cost comparison.

### Preview harness
- `matmoora-web/scripts/screenshot.mjs` — Playwright-driven, 10 shots across both languages in one command.

---

## Known open questions

1. **Logo PNGs** — the Drive share with the raster files isn't reachable from this session anymore. The SVG wordmark is a faithful stand-in; drop the real `.png` files at `matmoora-web/public/brand/` when available and swap `Logo.tsx` for `<Image>`.
2. **DIN Next Arabic license** — either buy a web license (recommended for brand fidelity) or lock Cairo in the identity sheet.

---

## What remains before go-live

### Phase 1 (blocking)
- [ ] Install the Claude GitHub App on `Majdiden/matmoora` so the branch can push → <https://github.com/apps/claude/installations/select_target>.
- [ ] First Vercel deploy with `MATMOORA_FIXTURES=1` — gives a public URL immediately. See `VERCEL_DEPLOY.md`.
- [ ] Stand up the Railway CMS stack (WordPress + MariaDB + Meilisearch). See `RAILWAY_DEPLOY.md`.
- [ ] Install the paid plugins (ACF Pro, WPML) via the WP admin.
- [ ] Switch Vercel off fixture mode and point it at the Railway CMS.
- [ ] Run `pnpm codegen` against the live schema to pin the GraphQL types.
- [ ] Import the Drive content: 7 investigations + their articles/stories/publications/videos/activities.

### Phase 1 (nice to have before launch)
- [ ] Investigation cover images (ACF `cover_image` field; swap the topographic scribble on the grid cards).
- [ ] Flipbook rendering for `publication` posts (either react-pdf viewer or an Issuu/FlipHTML5 iframe).
- [ ] Video/audio embed components for `video`/`audio` posts (react-player / SoundCloud iframe).
- [ ] Full-body article rendering with sanitized HTML + Tailwind Typography.

### Phase 2 (post-launch)
- [ ] Comments pipeline wired end-to-end (Akismet + Turnstile + moderation queue).
- [ ] Forms plugin decision (Fluent vs. Gravity) and real submission storage.
- [ ] Editorial curation on the homepage (featured flag on investigations).
- [ ] Newsletter signup (if the team wants one).

### Phase 3 (polish + longevity)
- [ ] Playwright E2E happy-path suite.
- [ ] Axe accessibility CI on every PR.
- [ ] Sentry release tracking wired to git SHA.
- [ ] Uptime alerts (BetterStack free tier) + on-call runbook.
- [ ] Database backup rotation to a cloud bucket (Backblaze B2 free tier).
