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
| `pnpm codegen` | Regenerate `lib/wp/generated.ts` from the WPGraphQL schema |

## Status

Pre-Phase 1 scaffold. Bilingual routing, layout, i18n, the WP/Meili clients,
and the API routes (revalidate, search, preview, health) are in place. Content
types, hero pieces, and font choices are deferred Phase 1 decisions — see
`docs/TECH_SPEC.md` §21.
