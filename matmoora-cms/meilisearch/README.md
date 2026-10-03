# Meilisearch — Railway service

Deploy this folder as a separate Railway service alongside the WordPress service in `../`.

## Railway setup

1. In your Railway project → **New Service → GitHub Repo** → `Majdiden/matmoora`
2. In the new service → **Settings → Service**:
   - **Root Directory**: `matmoora-cms/meilisearch`
3. Railway auto-detects the `Dockerfile` and `railway.json` in this folder.
4. **Variables**:
   - `MEILI_MASTER_KEY` — generate a 32-byte random hex (`openssl rand -hex 32`). Save this; the WordPress service needs the same value.
5. **Volumes**:
   - Add a Volume mounted at `/meili_data`. Persistent, survives redeploys.
6. **Networking → Public**: enable so WordPress + the search proxy can reach it over HTTPS. Note the generated URL.

## Wiring back to WordPress

On the WordPress service's Variables:
- `MEILI_HOST` = the public URL from step 6
- `MEILI_MASTER_KEY` = the same secret from step 4

Then from the WordPress service shell:
```bash
wp matmoora search:settings
wp matmoora search:reindex
```
