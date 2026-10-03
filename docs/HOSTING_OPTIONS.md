# Hosting — Matmoora

Two deployment paths are supported. Pick one based on priorities.

| Factor | Railway (recommended for this project) | Hetzner VPS |
|---|---|---|
| Monthly cost | ~$5–10 after free credits | ~€5 permanently |
| Ops effort | None once configured | SSH, upgrades, firewall |
| Scaling | One click per service | Resize the box |
| Free tier for staging | Yes, ~$5/mo credits | No (always paid) |
| Guide | **`RAILWAY_DEPLOY.md`** | §16 of the tech spec + the note below |

The user's chosen path is **Railway + Vercel**. Follow:

1. **`RAILWAY_DEPLOY.md`** — stand up WordPress + MariaDB + Meilisearch on Railway.
2. **`VERCEL_DEPLOY.md`** — deploy the Next.js frontend on Vercel's Hobby plan.

## Alternative: Hetzner VPS

If per-month cost matters more than ops time, the same Docker Compose stack runs on a €5 Hetzner CX22 in Falkenstein. Follow the Compose + Caddy flow at `TECH_SPEC.md` §16, substituting the plugins installed via Composer (`matmoora-cms/composer.json`) for the manual plugin uploads.

The code is identical either way — only the deploy wiring differs.

## Realistic monthly cost

| Setup | First month | Ongoing |
|---|---|---|
| Railway + Vercel (fixture preview) | $0 | $0 |
| Railway + Vercel (live, light traffic) | $0 (free credits) | ~$5–10 |
| Hetzner + Vercel | ~€5 | ~€5 |
