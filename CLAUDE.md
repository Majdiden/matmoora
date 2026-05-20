# Matmoora — Working Agreement for Claude Code

You are building the Matmoora website end-to-end. This file is the project-level context. Read it fully at the start of every session. The deep technical spec lives at `docs/TECH_SPEC.md` and is the source of truth for *what* to build; this file is about *how* to work.

---

## Project at a glance

- **What it is:** Bilingual (Arabic-default / English) content site for Matmoora.
- **Architecture:** Headless WordPress (CMS) + Next.js 15 (frontend). Two repos: `matmoora-cms/` and `matmoora-web/`.
- **Hosting:** WordPress self-managed on VPS via Docker; Next.js on Vercel.
- **Search:** Meilisearch (separate container alongside WP).
- **Status:** Pre-Phase 1. Content model and hero pieces are not yet defined.

Detailed architecture, schemas, file layout, naming, and patterns: read `docs/TECH_SPEC.md` before doing any non-trivial work. When the spec and this file disagree, the spec wins for technical content and this file wins for working style.

---

## How to work in this repo

### Before starting any task

1. Read `docs/TECH_SPEC.md` sections relevant to the task (use the table of contents — don't re-read the whole thing every time).
2. If a skill is available for what you're doing (e.g., `.claude/skills/matmoora-build/`), follow it.
3. If the task touches the content model, hero pieces, or anything in `docs/TECH_SPEC.md` §21 (Open Questions), stop and ask before proceeding — those decisions belong to the team, not you.

### Always

- **Default to the spec.** If the spec specifies a library, file location, naming convention, or pattern — use it. Do not introduce alternatives without asking. If you think the spec is wrong, say so and propose a change to the spec first, then implement.
- **Two repos, separate lifecycles.** `matmoora-cms/` (WordPress) and `matmoora-web/` (Next.js) deploy independently. Don't introduce a monorepo tooling layer (turborepo, nx, etc.) without explicit approval.
- **Server-first.** Use server components by default. Client components only for genuine interactivity. Never fetch CMS content client-side.
- **Typed.** TypeScript strict mode. Run `pnpm codegen` before working with GraphQL types. Don't write `any` — use `unknown` and narrow, or define the type properly.
- **RTL-aware.** Every UI change is tested in both Arabic and English. Use Tailwind logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`), not directional ones (`pl-*`, `pr-*`).
- **Performance budgets are real.** See `docs/TECH_SPEC.md` §11.1 and §9.3. If a feature can't hit them, the feature changes, not the budget.

### Never

- Never store secrets in code, in `next.config.ts`, or in committed `.env` files. Only `.env.example` is committed. Real secrets live in Vercel env panel and on the VPS in Docker secrets.
- Never bypass the content model. If you need a field, add it to the ACF group, run codegen, and use it through the typed query. Don't string-template HTML out of arbitrary post meta.
- Never reach for client-side data fetching when server-side works. No `useEffect` to load CMS content.
- Never push to `main` directly. PRs only, even when working solo — preview deployments depend on it.
- Never assume a hero piece is built. Hero pieces are scoped in Phase 1; if you don't see a brief in `docs/hero-pieces/<slug>.md`, the piece doesn't exist yet and you should ask before generating one.
- Never enable a WordPress plugin without adding it to `matmoora-cms/plugins.lock` (a manually maintained list — keeps prod and dev aligned).

### Commit style

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `style:`, `perf:`.
- Scope the commit to a single concern. If a commit message needs "and", split the commit.
- Reference the relevant spec section in the body when the change implements a spec decision: `Implements TECH_SPEC §7.4`.

### Branch naming

- `feat/<short-description>` for new work
- `fix/<short-description>` for bugs
- `chore/<short-description>` for tooling, deps, docs
- `wip/<anything>` for work-in-progress branches that aren't ready for review

---

## Decisions already made (don't re-litigate)

These are locked. If you think one should change, raise it explicitly — don't quietly do something else.

- WordPress is headless. Themes do nothing for the public site.
- WPGraphQL is the only public API surface from WP. REST is internal-only (for form submissions, etc.).
- WPML is the multilingual plugin. Not Polylang.
- Arabic is the default locale. Bare `/` redirects to `/ar`.
- URL-based locale detection. `localeDetection: false` in next-intl. No `Accept-Language` sniffing.
- Self-managed VPS for WordPress (Docker Compose + Caddy + MariaDB + Meilisearch).
- Search uses Meilisearch, not WP search.
- Forms use Fluent Forms (or Gravity Forms — final pick during Phase 3) in WP, rendered by Next.js, submitted via API proxy.
- Comments are native WP comments, moderated, submitted via API proxy with Turnstile.
- Two repos, not a monorepo.
- pnpm, not npm or yarn.
- Tailwind v4, not v3.
- Next.js 15 App Router, not Pages Router.

---

## How to ask for help

When you're blocked or uncertain:

1. State what you're trying to do.
2. State what the spec says (or that the spec is silent).
3. State your proposed approach and the alternative you're weighing.
4. Ask the specific question.

Bad: "How should I do auth?"
Good: "I'm adding an admin-only Vercel route to trigger a Meilisearch reindex. The spec mentions search keys (§17.3) but doesn't specify auth for admin frontend endpoints. I'm thinking a shared-secret header (similar to `REVALIDATE_SECRET`) since it's not user-facing. Alternative: full session auth via WP. Which fits better?"

---

## What success looks like

- The spec stays accurate. If you build something and the spec didn't predict it correctly, update the spec in the same PR. Stale specs are worse than no specs.
- Every hero piece has its own README that an editor could read.
- Every WP plugin in use is in `plugins.lock` and explained in `matmoora-cms/README.md`.
- Every environment variable is in `.env.example` with a comment.
- Pages render under 2.5s LCP on mobile 4G.
- The site works the same in Arabic as in English. RTL bugs are bugs, not "Arabic-specific" bugs.
