# Hosting & deployment

The architecture (TECH_SPEC §2) is host-agnostic on the WordPress side. Two
deployment paths are supported.

## Path A — Hosted WordPress (current plan: Wevrlabs)

**What the host runs:** WordPress itself, MariaDB, PHP-FPM, mail, backups.

**What we deploy:** only the custom code in `matmoora-cms/`:

| Source path | Destination on the host |
|---|---|
| `matmoora-cms/wp-content/mu-plugins/*.php` | `wp-content/mu-plugins/` |
| `matmoora-cms/wp-content/themes/matmoora-stub/*` | `wp-content/themes/matmoora-stub/` |
| `matmoora-cms/acf-json/*.json` | `wp-content/acf-json/` |

The Docker compose files, `Caddyfile`, `secrets/`, and `deploy.sh` in
`matmoora-cms/` are **not used** in this path — they exist for local
development (`docker-compose.local.yml`) and as a complete reference if you
ever move off the managed host.

### Deployment

Two options:

1. **Manual** — SFTP/cPanel/SSH the three paths above when they change. Slow
   but zero setup.
2. **GitHub Actions** — `.github/workflows/cms-deploy.yml` is provided. Add
   these repo secrets:

   - `CMS_SFTP_HOST`
   - `CMS_SFTP_USER`
   - `CMS_SFTP_PASSWORD` (or use SSH key auth — see the action's docs)
   - `CMS_SFTP_REMOTE_PATH` (path to the WP install root on the host)
   - `CMS_SFTP_PORT` (optional, defaults to 22)

   Pushes to `main` that touch the three tracked subdirectories trigger an
   upload.

### Plugins

Installed once via the WP admin UI; tracked in `matmoora-cms/plugins.lock`.
**Never enable a plugin without adding it to that file.** Major plugins that
can break the GraphQL schema (WPGraphQL, WPML, WPGraphQL for ACF) update
**manually** with a smoke test after.

### Database

Managed by the host. Don't export and re-import as a deploy mechanism — ACF
field groups are JSON-synced (see `acf-json/`), so the schema lives in git.

### Meilisearch

Meilisearch **cannot live alongside WordPress on a managed host.** Options:

- **Meilisearch Cloud** (paid, easiest, recommended for a managed-WP setup).
- **Tiny self-managed VPS** running just the Meilisearch container.
- **Skip** — fall back to WP search (rejected by spec for Arabic).

Once provisioned, set `MEILI_HOST` on the Vercel side and
`MATMOORA_MEILI_HOST` / `MATMOORA_MEILI_ADMIN_KEY` on the WP side. The
indexing mu-plugin (`matmoora-search.php`) talks to whatever host you point
it at.

### Backups

Wevrlabs handles WP backups. `matmoora-cms/scripts/backup-db.sh` is only
relevant if you move to self-managed.

---

## Path B — Self-managed VPS (spec default)

`matmoora-cms/docker-compose.yml`, `Caddyfile`, `deploy.sh`, and
`scripts/backup-db.sh` are the operational layer for this path. See
TECH_SPEC §16 for the full server requirements and `matmoora-cms/README.md`
for the deploy loop.

### Local development with this path

```bash
cd matmoora-cms
cp .env.example .env             # fill values
docker compose -f docker-compose.local.yml up -d
```

Useful even when production is on Wevrlabs — gives an offline WP for testing
mu-plugin changes and ACF field tweaks before pushing.

---

## Frontend (Vercel) — same in both paths

Push to `main` deploys to production; PRs get preview URLs. Required env vars
are listed in `matmoora-web/.env.example`. The CI workflow
(`.github/workflows/web-ci.yml`) runs typecheck, lint, tests, and build on
every PR.

## Migrating from cPanel-zip workflows

The site's source of truth is git + the WP database. There is **no zip step**:

- WP is installed once on the host (Wevrlabs or wherever).
- Custom code lives in git → uploaded via SFTP/Actions when changed.
- Content is authored in WP and persists in the host's database. We never
  export/import as a deploy step.
- ACF schema lives in `acf-json/` and auto-syncs on every WP load.

If you need to clone an environment (prod → staging), copy the database
+ uploads from the host's backup system, then point the staging frontend at
the new endpoint. No zip required.
