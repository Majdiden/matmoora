---
name: matmoora-build
description: Build, extend, and maintain the Matmoora bilingual content website. Use this skill whenever the user asks to set up the project, add a content type, add a page or route, build a hero piece (custom interactive feature), wire up search/forms/comments, deploy or update the self-managed WordPress, troubleshoot the headless WP + Next.js integration, or do anything involving the matmoora-cms or matmoora-web repos. Use this skill even when the user does not name it explicitly — any task involving WordPress GraphQL, Next.js App Router with bilingual Arabic/English routing, Meilisearch indexing from WP, ACF content modeling, or Vercel-deployed Next.js paired with a self-hosted WP backend belongs to this skill.
---

# matmoora-build

End-to-end skill for building the Matmoora website: a bilingual (Arabic-default / English) headless content site on WordPress + Next.js 15, self-managed VPS for the CMS, Vercel for the frontend, with Meilisearch for search.

The deep technical spec lives at `docs/TECH_SPEC.md` in the project repo. **This skill is the workflow companion to that spec.** The spec answers *what* to build; this skill answers *how to work through common tasks*.

## When this skill triggers

- Setting up the project from scratch (initial scaffold of either repo)
- Adding or modifying a content type (CPT + ACF + GraphQL + Next.js template)
- Building a hero piece (custom interactive feature)
- Wiring or debugging the publish-to-live flow (revalidation, preview mode)
- Adding or modifying bilingual routing, translations, or RTL behavior
- Anything touching Meilisearch (indexing, search UI, key rotation)
- Anything touching the forms or comments pipeline
- Deploying the CMS or updating the VPS configuration
- Diagnosing performance, accessibility, or RTL bugs

If the user's request matches any of these, follow this skill. If the user's request is purely about Phase 1 decisions (which content types, which hero pieces, fonts, etc.), redirect them — those decisions live with the team, not in code.

## Working agreement

Before doing anything non-trivial:

1. **Read the spec section relevant to the task.** Use the table of contents in `docs/TECH_SPEC.md`. Don't re-read the whole thing every time.
2. **Read `CLAUDE.md` in the project root.** It carries the working agreement and "decisions already made (don't re-litigate)".
3. **Check the right reference file in this skill** (see "Workflows" below) — they encode the gotchas that bit us before.
4. **If the task touches an Open Question** (TECH_SPEC §21), stop and ask. Don't pick.

## Working repos

```
matmoora-cms/   # WordPress: docker-compose, mu-plugins, ACF JSON, deploy scripts
matmoora-web/   # Next.js frontend: App Router, TypeScript, Tailwind v4
```

They deploy independently. Don't wire them with a monorepo tool.

## Workflows

The work splits into a small number of recurring task types. Each has a dedicated reference file with patterns, gotchas, and step-by-step instructions. **Read the relevant reference before starting.**

### Setting up from scratch

→ `references/setup.md`

Initial scaffold of both repos. Covers: Next.js bootstrap with the project's specific structure, WordPress docker-compose, plugin install, ACF JSON sync, codegen setup, environment variables, the first end-to-end smoke test.

Read this first if either repo is empty or near-empty.

### Adding a content type

→ `references/content-type.md`

The single most common change. Covers: registering the CPT in PHP (`mu-plugins/`), defining the ACF field group in JSON, exposing it through WPGraphQL, running codegen, building the Next.js template, adding it to sitemap and search indexer.

This is a multi-file change. Skipping a step (e.g., forgetting to add `show_in_graphql`) is the most common cause of "the new type works in WP but the Next.js side can't see it".

### Building a hero piece

→ `references/hero-piece.md`

Hero pieces are custom interactive features (specific pieces scoped during Phase 1). Each is a self-contained component under `components/hero/<piece-name>/` with its own README, server shell, client interactions, and RTL behavior. This reference covers the contract every hero piece must follow (TECH_SPEC §9), the performance budget, the directory layout, and a build checklist.

If the user asks to "make this scroll thing" or "add the map feature" — this is the right reference.

### Bilingual / RTL work

→ `references/i18n.md`

Adding a new translated string, debugging why an Arabic page renders LTR, handling mixed-direction content, font swapping, locale-aware URLs, WPML query pitfalls. RTL bugs are bugs, not "Arabic-specific quirks."

### Search (Meilisearch)

→ `references/search.md`

How the WP mu-plugin indexes posts, how the Next.js API proxies queries, key management (master vs admin vs search-only), reindexing from scratch with `wp matmoora reindex`, locale-scoped indexes, debugging "the search returns nothing" / "the search returns stale results".

### Forms

→ `references/forms.md`

The form pattern: editor authors in WP (Fluent Forms), Next.js fetches the schema via GraphQL, renders with our `<FormRenderer>`, submits via API proxy with server-side Zod re-validation and Turnstile verification.

### Comments

→ `references/comments.md`

Native WP comments rendered server-side, submission via API proxy, moderation flow, Akismet + Turnstile setup. Includes the revalidation step that publishes approved comments.

### CMS deployment & VPS operations

→ `references/cms-ops.md`

Docker compose layout, Caddyfile, backup scripts, plugin update policy (which plugins auto-update, which are manual), how to roll back, how to bring up a new staging environment, what to check after every WP core update.

This is the reference to consult before touching anything on the VPS.

### Frontend deployment

→ `references/web-deploy.md`

Vercel project config, environment variables per environment, preview-deploy behavior, the production cutover checklist.

## Universal patterns

These show up everywhere. Use them by default; deviate only with a stated reason.

### File creation patterns

When adding a route that fetches CMS content:

```typescript
// app/[locale]/(content)/<type>/[slug]/page.tsx
import { wpClient } from '@/lib/wp/client';
import { GetThingDocument } from '@/lib/wp/generated';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const { things } = await wpClient.request(GetAllThingSlugsDocument);
  return things.nodes.flatMap(t => [
    { locale: 'ar', slug: t.slug },
    { locale: 'en', slug: t.translation?.slug ?? t.slug },
  ]);
}

export const revalidate = 3600;

export async function generateMetadata({ params }): Promise<Metadata> {
  // ... pull Yoast SEO via separate query
}

export default async function Page({ params }) {
  const { locale, slug } = await params;
  const { thing } = await wpClient.request(GetThingDocument, {
    slug,
    language: locale.toUpperCase(),
  });
  if (!thing) notFound();
  return <ThingTemplate data={thing} />;
}
```

Every CMS-content page follows this shape. If yours doesn't, justify it.

### GraphQL query files

Queries live in `lib/wp/queries/` as `.graphql` files. Codegen produces typed functions. Never write GraphQL strings inline in components.

### Naming

- Components: `PascalCase.tsx`, one component per file, export name matches file name.
- Hooks: `useThing.ts`, named export only (never default-exported).
- Routes: lowercase, kebab-case slugs.
- GraphQL files: `kebab-case.graphql`.

### When the spec is silent

If the spec doesn't cover what you're doing:

1. Pick the option most consistent with the existing patterns.
2. State the choice in the PR description.
3. Propose adding it to the spec (or this skill's references).

## What this skill will not do

- **Make Phase 1 decisions for the team.** Content types, hero pieces, fonts, exact form provider — these belong to the Matmoora team. If the user asks Claude to pick, push back and surface the open questions instead.
- **Re-architect.** The decisions in `CLAUDE.md` and `docs/TECH_SPEC.md` are locked. If you think one is wrong, raise it explicitly — don't quietly do something else.
- **Add tooling without justification.** No new bundlers, no new state libraries, no new test frameworks beyond what the spec lists, unless there's a specific need that the existing stack genuinely can't cover.
- **Generate placeholder content.** If a hero piece doesn't have a brief in `docs/hero-pieces/<slug>.md`, don't invent one.

## Sanity checklist (run before any PR)

- [ ] Spec section relevant to the change is still accurate. Update it if not.
- [ ] If a new content type or hero piece: it's in both `ar` and `en` end-to-end.
- [ ] Tailwind directional classes (`pl-*`, `pr-*`) replaced with logical (`ps-*`, `pe-*`).
- [ ] No new env var without an entry in `.env.example`.
- [ ] No `console.log` left in.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm lint` passes.
- [ ] If touching WP: `plugins.lock` is current.
- [ ] If touching the publish-to-live flow: tested a publish in WP and confirmed the page updated.
