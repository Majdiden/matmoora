# matmoora-cms

Headless WordPress CMS for the Matmoora bilingual content site. Self-managed on
a VPS via Docker Compose. The public site is rendered by Next.js
(`../matmoora-web`) — WordPress receives no public traffic.

See `../docs/TECH_SPEC.md` (§16 deployment, §17 security), `../docs/HOSTING.md`
(hosted-vs-self-managed deployment paths), and `../CLAUDE.md`.

## What lives in this repo

| Path | Purpose |
|---|---|
| `docker-compose.yml` | Production stack: WordPress, MariaDB, Caddy, Meilisearch |
| `docker-compose.local.yml` | Local development stack |
| `Caddyfile` | Reverse proxy + auto-HTTPS |
| `wp-content/mu-plugins/` | Must-use plugins (revalidation, search indexing, security hardening) |
| `wp-content/themes/matmoora-stub/` | Headless stub theme |
| `acf-json/` | JSON-synced ACF field groups |
| `plugins.lock` | Manually maintained list of installed plugins |
| `deploy.sh` | VPS deploy script |
| `secrets/` | File-mounted Docker secrets (git-ignored) |

WordPress core, contributed plugins, and uploads are **not** vendored — only the
custom code above is tracked.

## mu-plugins

- **matmoora-revalidate** — on publish/unpublish, calls the Next.js
  `/api/revalidate` webhook so the affected page rebuilds (TECH_SPEC §7.4).
- **matmoora-search** — keeps Meilisearch in sync with WP content; provides
  `wp matmoora reindex` for a full rebuild (TECH_SPEC §12).
- **matmoora-security** — disables XML-RPC, removes the public REST users
  endpoint, strips WP generator meta (TECH_SPEC §17.2).

## Plugins

The full plugin set is tracked in `plugins.lock`. Nothing is installed yet —
this is a pre-Phase 1 scaffold. Planned set (TECH_SPEC §3): WPGraphQL, ACF Pro,
WPGraphQL for ACF, Yoast SEO + WPGraphQL Yoast, WPML + wp-graphql-wpml, Akismet,
Wordfence. Forms plugin (Fluent Forms vs Gravity Forms) is a Phase 3 decision.

**Never enable a plugin without adding it to `plugins.lock`.**

WPGraphQL, WPML, and WPGraphQL for ACF are updated **manually** (they can break
the GraphQL schema) — run a content-fetch smoke test after each update.

## Local development

```bash
cp .env.example .env          # fill in values
docker compose -f docker-compose.local.yml up -d
```

WordPress is then at `http://localhost:8080`, Meilisearch at
`http://localhost:7700`.

## Production deployment

Provision `secrets/db_password`, `secrets/db_root_password`,
`secrets/meili_master_key`, then:

```bash
./deploy.sh
```

It pulls config, snapshots the database, and rebuilds the containers.
