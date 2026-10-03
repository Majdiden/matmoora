# Railway deploy — Matmoora CMS

This is the end-to-end guide for standing up the backend (WordPress + MariaDB + Meilisearch) on Railway, and connecting it to the Next.js frontend on Vercel.

Target topology:

```
┌────────────────────┐        GraphQL         ┌──────────────────────────┐
│  Vercel            │  ◄───────────────────  │ Railway                  │
│  matmoora-web      │                        │  ┌─────────────────────┐ │
│  (Next.js 15)      │  ──── revalidate ──►   │  │ wordpress (apache)  │ │
│                    │                        │  └─────┬────────┬──────┘ │
└─────────┬──────────┘                        │        │        │        │
          │                                   │  ┌─────▼─────┐  │        │
          │                                   │  │ mariadb   │  │        │
          │                                   │  │ (plugin)  │  │        │
          │                                   │  └───────────┘  │        │
          │                                   │                 │        │
          │  (search proxy)                   │  ┌──────────────▼──────┐ │
          └───────────────────────────────────┼──│ meilisearch         │ │
                                              │  └─────────────────────┘ │
                                              └──────────────────────────┘
```

Railway is the chosen host because it runs the whole Docker stack as independent services, has first-class MariaDB, supports persistent volumes, and auto-deploys from GitHub. The free plan ($5 credits/month) comfortably runs the WordPress + Meilisearch services for a staging preview; a paid Developer plan (~$5/mo + usage) covers production comfortably.

---

## Prerequisites

- A Railway account (free tier is fine for first boot).
- The GitHub repo pushed and connected to Railway.
- A Vercel account with `matmoora-web` deployed (even in fixture mode).
- Licensed plugins ready to upload: **ACF Pro** (.zip from advancedcustomfields.com) and **WPML** (.zip from wpml.org).

---

## Phase 1 — Railway project + database

1. In Railway: **New Project → Deploy from GitHub repo** → pick `Majdiden/matmoora`. Choose the `matmoora-cms` directory as the root.
2. Railway detects the `Dockerfile` and provisions a WordPress service.
3. Add a database: **New → Database → MariaDB**. It attaches `MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_HOST`, `MYSQL_PORT` to the project.
4. On the WordPress service, go to **Variables** and bind the DB variables (`$\{\{MariaDB.MYSQL_URL\}\}` and friends). The entrypoint script parses `MYSQL_URL` into the discrete values the stock WordPress image expects.
5. Still in **Variables**, add the WordPress salts (generate at <https://api.wordpress.org/secret-key/1.1/salt/>) and these values:
   ```
   MATMOORA_REVALIDATE_URL=https://<vercel-domain>/api/revalidate
   MATMOORA_REVALIDATE_SECRET=<generate a 32-byte secret>
   MATMOORA_PUBLIC_URL=https://<vercel-domain>
   MEILI_HOST=  # filled in Phase 2
   MEILI_MASTER_KEY=  # filled in Phase 2
   ```
6. Deploy. The service exposes a Railway-provided URL like `matmoora-cms-production.up.railway.app`. Visit `/wp-login.php` — WordPress's install wizard will greet you if the DB is reachable.

---

## Phase 2 — Meilisearch service

1. In the same Railway project: **New Service → GitHub Repo** → pick `Majdiden/matmoora` again.
2. In the new service → **Settings → Service**:
   - **Root Directory**: `matmoora-cms/meilisearch`
   - Railway auto-detects the `Dockerfile` + `railway.json` in that folder.
3. Add a **Volume** mounted at `/meili_data` (Railway Volumes are persistent across deploys).
4. On the Meilisearch service **Variables**:
   ```
   MEILI_MASTER_KEY=<generate: openssl rand -hex 32>
   ```
5. **Networking → Generate Domain** so WP + the search proxy can reach it over HTTPS. Note the URL.
6. Back on the WordPress service, set:
   ```
   MEILI_HOST=https://matmoora-meili-production.up.railway.app
   MEILI_MASTER_KEY=<same secret>
   ```
7. Trigger a redeploy of the WordPress service so it picks up the new vars.

---

## Phase 3 — WordPress first-time setup

Inside the Railway "Deploy Logs" view, open a shell on the WordPress service (**Settings → Open Shell**) and run:

```bash
# WP install
wp core install \
  --url="$MATMOORA_PUBLIC_URL" \
  --title="Matmoora" \
  --admin_user=matmoora \
  --admin_password="$(openssl rand -hex 16)" \
  --admin_email=hello@matmoora.org

# Activate the stub theme + mu-plugins
wp theme activate matmoora-stub

# Install the Composer-managed plugins
wp plugin activate wp-graphql wordpress-seo add-wpgraphql-seo akismet wordfence
```

For **ACF Pro** and **WPML** (paid, not in Composer):

1. Upload the .zip files to the WP admin → Plugins → Add New → Upload.
2. Activate both.
3. `wp plugin install wpgraphql-acf wp-graphql-wpml --activate`

Then push the search config and reindex:

```bash
wp matmoora search:settings
wp matmoora search:reindex
```

---

## Phase 4 — Point Vercel at Railway

In the Vercel project for `matmoora-web`, go to **Settings → Environment Variables** and set:

```
WORDPRESS_GRAPHQL_ENDPOINT = https://<cms Railway URL>/graphql
WP_BASE_URL                = https://<cms Railway URL>
MEILI_HOST                 = https://<meili Railway URL>
MEILI_SEARCH_KEY           = <search-only key from Meilisearch>
REVALIDATE_SECRET          = <same as MATMOORA_REVALIDATE_SECRET on Railway>
PREVIEW_SECRET             = <generate a 32-byte secret>
NEXT_PUBLIC_ENV            = production
NEXT_PUBLIC_SITE_URL       = https://<your custom domain>
```

Remove or set to `0` the `MATMOORA_FIXTURES` variables so the data layer starts calling the live WPGraphQL endpoint. Trigger a redeploy.

Smoke test: `curl https://<cms Railway URL>/graphql` returns a schema, and the Vercel site's `/en` page loads real investigations.

---

## Phase 5 — Content import + go-live

- Create editor accounts in the WP admin.
- Import the 7 Drive investigations + related content as draft, then publish.
- Each publish fires the revalidate webhook; the Vercel page rebuilds within a few seconds.
- Configure the custom domain (`matmoora.org` + `cms.matmoora.org`) in Vercel + Railway respectively; both auto-issue TLS.

---

## Costs

| Component | Usage pattern | Monthly cost |
|---|---|---|
| Railway free credits | ~$5 included on Hobby plan | **$0** for the first ~500 hours |
| WordPress service | ~0.5 vCPU average | ~$3–5 beyond the free tier |
| MariaDB plugin | Low write volume | ~$2 |
| Meilisearch service | Small index | ~$2 |
| Vercel Hobby | Preview + prod | **$0** |
| **Total realistic** | | **~$5–10/mo** once past the free credits |

Vercel Pro ($20/mo) is only needed if monthly bandwidth exceeds 100 GB or if we want team seats.

---

## Backups

Railway's MariaDB plugin exposes an auto-backup toggle (**Database → Settings → Backups**). Enable daily snapshots. The repo's `scripts/backup-db.sh` is still useful for ad-hoc dumps:

```bash
railway run --service wordpress -- bash scripts/backup-db.sh
```

Rotate the output to a cloud bucket (Backblaze B2 free tier is sufficient).

---

## Why not just the VPS (Hetzner)?

The Hetzner VPS path is still documented in `HOSTING_OPTIONS.md` as a cheaper, more flexible alternative. Pick Railway when ops time matters more than per-month cost; pick the VPS when ongoing cost matters more. The code is identical either way — only the deploy wiring differs.
