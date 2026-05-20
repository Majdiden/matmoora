# matmoora-web

Next.js 15 frontend for the Matmoora bilingual content site. Renders content
authored in the headless WordPress CMS (`../matmoora-cms`). Deploys to Vercel.

See `../docs/TECH_SPEC.md` for the full architecture and `../CLAUDE.md` for the
working agreement.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS v4 (CSS-first config, no `tailwind.config.ts`)
- `next-intl` — bilingual routing, Arabic default, RTL-aware
- `graphql-request` + `graphql-codegen` — typed WPGraphQL access
- Meilisearch JS client — search UI

## Local development

```bash
pnpm install
cp .env.example .env.local   # fill in values
pnpm codegen                 # needs WORDPRESS_GRAPHQL_ENDPOINT + query files
pnpm dev
```

The site runs at `http://localhost:3000`; `/` redirects to `/ar`.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright + axe end-to-end and a11y tests |
| `pnpm codegen` | Regenerate `lib/wp/generated.ts` from the WPGraphQL schema |

## Status

Pre-Phase 1 scaffold. In place:

- Bilingual routing, layout, i18n, RTL, language switcher.
- WPGraphQL client + lazy Meilisearch client.
- API routes: revalidate, search proxy, preview/exit-preview, forms submit,
  comments submit, health.
- Provider-agnostic `FormRenderer` + `schemaToZod` (Fluent Forms default).
- Comment list/form with Turnstile + Akismet handoff.
- Preview banner shown when draft mode is on.
- CSP, HSTS, frame-ancestors, Permissions-Policy headers in production.
- Sentry instrumentation (no-op without DSN).
- Vitest + Playwright + axe scaffolds.

Deferred Phase 1 decisions: content types, hero pieces, font choices. See
`../docs/TECH_SPEC.md` §21.
