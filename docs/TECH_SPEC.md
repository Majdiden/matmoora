# Matmoora Website — Technical Specification

**Status:** Draft
**Audience:** Engineers building or maintaining the system
**Last updated:** 2026-05-19

---

## 1. Purpose & Scope

This document specifies the end-to-end implementation of the Matmoora website. It is the working reference for engineers — architecture, data model, code patterns, naming, deployment.

The site is a bilingual (Arabic / English) content-driven property built on a headless CMS architecture. Content is authored in WordPress; the public site is rendered by Next.js. A subset of pages are richer "hero" experiences with custom interactivity, defined later in Phase 1.

Out of scope for this spec: branding, copy, business decisions about which hero pieces ship. Those live in the project timeline and the content brief.

---

## 2. Architecture Overview

```
┌─────────────────────┐         ┌────────────────────────┐
│   WordPress (CMS)   │         │   Next.js (Frontend)   │
│                     │         │                        │
│  - Content authors  │  ◄────  │  - Public site         │
│  - Custom post      │  GraphQL│  - SSG + ISR rendering │
│    types + ACF      │  fetch  │  - Bilingual routing   │
│  - WPGraphQL        │         │  - Hero piece widgets  │
│  - WPML             │         │  - Search UI           │
│  - Yoast SEO        │         │                        │
└─────────────────────┘         └────────────────────────┘
         │                                  │
         │  webhook: on content publish     │
         └──────────────────────────────────┘
                  /api/revalidate
         │                                  │
         │   index sync on content publish  │
         ▼                                  ▼
┌─────────────────────┐         ┌────────────────────────┐
│  Self-managed VPS   │         │   Vercel (Frontend)    │
│  (Docker + Caddy)   │         │   - Edge CDN           │
│  - WordPress        │         └────────────────────────┘
│  - MariaDB          │
│  - Meilisearch      │
│  - Backups (nightly)│
└─────────────────────┘
```

**Key properties:**

- WordPress is *only* a CMS. No public traffic hits it directly.
- Next.js builds against WordPress at build time and revalidates on demand.
- All public pages are pre-rendered HTML served from the edge.
- Editors see changes live within ~10 seconds of publishing via on-demand ISR.
- Search runs against Meilisearch (not WordPress), kept in sync via the same publish webhook.

---

## 3. Stack & Versions

### Frontend (`matmoora-web`)

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 15+ (App Router) | Stable as of writing |
| Language | TypeScript (strict) | `noUncheckedIndexedAccess: true` |
| Styling | Tailwind CSS v4 | Logical properties for RTL |
| GraphQL client | `graphql-request` + `graphql-codegen` | Typed, no Apollo runtime |
| i18n | `next-intl` | Server-side, App Router compatible |
| Forms | `react-hook-form` + `zod` | UI layer; submission target = WP forms plugin (§13) |
| Search | Meilisearch JS client | Instant search UI |
| Image | `next/image` with WP remote pattern | |
| Animation (hero pieces) | TBD per piece — typically Framer Motion + GSAP | Pinned per-feature |
| Hosting | Vercel | |

### Backend (`matmoora-cms`)

| Concern | Choice | Notes |
|---|---|---|
| CMS | WordPress 6.x (latest stable) | |
| API | WPGraphQL | REST not used externally |
| Custom fields | Advanced Custom Fields (ACF) Pro | |
| ACF → GraphQL | WPGraphQL for ACF | |
| SEO | Yoast SEO + WPGraphQL Yoast | |
| Multilingual | WPML + `wp-graphql-wpml` | See §6 |
| Forms | Fluent Forms (or Gravity Forms) + GraphQL exposure | See §13 |
| Comments | Native WP comments with moderation | See §14 |
| Search backend | Meilisearch (separate container) | Indexed from WP via plugin/hook |
| Hosting | Self-managed VPS (Docker Compose, reverse proxy) | See §16 |
| Updates | Auto for core + minor plugin; manual for major | |

### Repo layout

Two repos, not a monorepo. Different deployment lifecycles, different update cadences.

```
matmoora-cms/      # WordPress: docker-compose, mu-plugins, ACF JSON, deploy scripts
matmoora-web/      # Next.js frontend
```

---

## 4. Frontend Project Structure

```
matmoora-web/
├── app/
│   ├── [locale]/                    # 'ar' | 'en'
│   │   ├── layout.tsx               # Locale + dir, fonts, header/footer
│   │   ├── page.tsx                 # Home
│   │   ├── (content)/               # Route group, no URL segment
│   │   │   ├── publications/
│   │   │   │   ├── page.tsx         # Listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx     # Detail (publication template)
│   │   │   ├── articles/[slug]/page.tsx
│   │   │   └── [type tbd]/[slug]/page.tsx
│   │   ├── hero/                    # Hero pieces (scoped Phase 1)
│   │   │   └── [slug]/page.tsx
│   │   ├── search/
│   │   │   └── page.tsx             # Search results UI
│   │   ├── contact/
│   │   │   └── page.tsx             # Contact form (and other forms)
│   │   └── not-found.tsx
│   └── api/
│       ├── revalidate/route.ts      # WP webhook → on-demand ISR
│       ├── search/route.ts          # Proxy to Meilisearch (server-side key)
│       ├── forms/[id]/submit/route.ts  # Form submission proxy to WP
│       ├── preview/route.ts         # Draft mode entry
│       └── exit-preview/route.ts
├── components/
│   ├── ui/                          # Primitives (Button, Card, etc.)
│   ├── layout/                      # Header, Footer, LangSwitcher
│   ├── content/                     # ContentRenderer, FieldBlock, RichText
│   ├── search/                      # SearchBar, SearchResults, hit components
│   ├── comments/                    # CommentList, CommentForm
│   ├── forms/                       # FormRenderer driven by WP form schema
│   └── hero/                        # Hero piece components (one folder per piece)
│       └── <piece-name>/
│           ├── index.tsx
│           ├── <piece-name>.client.tsx
│           ├── types.ts
│           └── README.md
├── lib/
│   ├── wp/
│   │   ├── client.ts                # graphql-request client
│   │   ├── queries/                 # .graphql files
│   │   └── generated.ts             # codegen output
│   ├── search/
│   │   └── meili.ts                 # Meilisearch client
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── routing.ts
│   │   └── messages/                # UI strings per locale
│   └── utils/
├── messages/
│   ├── ar.json
│   └── en.json
├── public/
├── middleware.ts                    # Locale prefix enforcement only
├── next.config.ts
└── codegen.ts                       # Tailwind v4 is CSS-first; theme lives in app/globals.css
```

**Naming conventions:**

- Components: `PascalCase`, one component per file, file name matches export.
- Client components: suffix `.client.tsx` only when ambiguity matters or when colocated with a server wrapper. Default is server.
- Hooks: `useThing.ts`, never default-exported.
- GraphQL queries: `kebab-case.graphql`, codegen produces `getThingQuery` and `GetThingQueryResult` types.
- Routes: lowercase, kebab-case slugs.

---

## 5. Content Model

The content model is the contract between WordPress and Next.js. It is defined in Phase 1 and frozen before design (Phase 2). Adding a content type after Phase 2 starts is a meaningful change request, not a small edit.

### 5.1 Conventions

Every custom post type (CPT) carries a base set of fields:

| Field | Type | Notes |
|---|---|---|
| `title` | string | WP native |
| `slug` | string | WP native |
| `status` | enum | WP native |
| `language` | enum (`ar` \| `en`) | WPML |
| `translation_of` | post reference | WPML link to counterpart |
| `seo` | Yoast group | title, description, og image |
| `featured_image` | media | |
| `published_at` | datetime | WP native |
| `updated_at` | datetime | WP native |

Per-type fields live in ACF field groups, exposed via WPGraphQL for ACF.

### 5.2 Example: `publication` CPT

```yaml
post_type: publication
graphql_single_name: publication
graphql_plural_name: publications
supports: [title, editor, thumbnail, custom-fields, comments]
has_archive: true
public: true
show_in_rest: true              # Required for WPGraphQL
acf_field_group:
  - name: authors
    type: repeater
    sub_fields:
      - { name: name, type: text }
      - { name: affiliation, type: text }
  - name: abstract
    type: textarea
  - name: pdf
    type: file
    return_format: array        # url, mime, filesize
  - name: publication_date
    type: date_picker
  - name: tags
    type: taxonomy
    taxonomy: publication_tag
  - name: related_publications
    type: relationship
    post_type: [publication]
    max: 5
  - name: hero_treatment
    type: select
    choices: [none, <hero_piece_slug>]   # Wired only if matching hero piece exists
```

Other CPTs (`article`, `multimedia_item`, etc.) follow the same pattern. Final list is locked in Phase 1.

### 5.3 Taxonomies

| Taxonomy | Applied to | Notes |
|---|---|---|
| `topic` | publication, article | Cross-type filtering |
| `publication_tag` | publication | Type-specific |
| `multimedia_type` | multimedia_item | audio, video, image |

### 5.4 Adding a content type

1. Register CPT in `mu-plugins/matmoora-content-types.php` (do not register via UI plugin — keeps it in version control).
2. Define ACF field group in JSON-synced location (`acf-json/`).
3. Add `show_in_graphql: true` and `graphql_single_name` / `graphql_plural_name`.
4. Run codegen on the frontend.
5. Create the corresponding template in `app/[locale]/(content)/<type>/[slug]/page.tsx`.
6. Add to sitemap generation and search indexer.

---

## 6. Bilingual Strategy

### 6.1 Decisions

- **URL pattern:** `/ar/...` and `/en/...`. No locale at root. Root redirects to `/ar` (Arabic default).
- **Default locale:** Arabic. The brand is Arabic-first; English is secondary.
- **Detection:** URL-based, not header-based. The locale segment is the source of truth. The middleware only enforces that every public route carries a locale prefix.
- **Translation model:** WPML per-post translations. Each post has a counterpart in the other language linked via WPML's translation relationships, exposed by `wp-graphql-wpml`.
- **UI strings:** `next-intl` with `messages/ar.json` and `messages/en.json`. Strings *not* content.
- **Direction:** `dir="rtl"` on `<html>` when `locale === 'ar'`. Tailwind v4 uses logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`) so most components are direction-agnostic.

### 6.2 Middleware (URL-based, minimal)

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

export default createMiddleware({
  ...routing,
  localePrefix: 'always',
  localeDetection: false,   // URL is source of truth, no header sniffing
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

Bare `/` redirects to `/ar` via `localeDetection: false` and `defaultLocale: 'ar'`. No `Accept-Language` parsing, no cookie reading. Predictable, debuggable, search-engine-friendly.

### 6.3 Fonts

| Locale | Font | Notes |
|---|---|---|
| Arabic | Placeholder — swappable later | Self-hosted via `next/font/local` |
| English | Placeholder — swappable later | `next/font/google` if Google-hosted |

Font choice is deferred. Implementation wraps fonts in a single `lib/fonts.ts` module so swapping later is one file change.

```typescript
// lib/fonts.ts — placeholder fonts, replace later
import { Inter, Noto_Sans_Arabic } from 'next/font/google';

export const fontArabic = Noto_Sans_Arabic({ subsets: ['arabic'], display: 'swap', variable: '--font-ar' });
export const fontLatin = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-en' });
```

### 6.4 RTL gotchas to handle deliberately

- Icons that imply direction (chevrons, arrows) must flip — use a `<DirectionalIcon>` wrapper or `[dir="rtl"]` CSS rules.
- Numbers and dates: locked in Phase 1 based on team preference (Hindi vs Western numerals in Arabic context).
- Mixed-direction content (Arabic with English brand names) — wrap inline foreign text in `<bdi>` or use `dir="auto"` on the container.
- Hero piece animations and SVG-based interactives must be tested in RTL; mirroring is not free.

### 6.5 Routing helpers

```typescript
// lib/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
});
```

---

## 7. Data Fetching

### 7.1 Client setup

```typescript
// lib/wp/client.ts
import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT!;

export const wpClient = new GraphQLClient(endpoint, {
  fetch: (url, init) => fetch(url, { ...init, next: { tags: ['wp'] } })
});

export const wpPreviewClient = (token: string) =>
  new GraphQLClient(endpoint, {
    headers: { Authorization: `Bearer ${token}` }
  });
```

### 7.2 Query pattern

Queries live in `.graphql` files alongside their usage. Codegen produces typed query functions.

```graphql
# lib/wp/queries/get-publication.graphql
query GetPublication($slug: ID!, $language: LanguageCodeFilterEnum!) {
  publication(id: $slug, idType: SLUG) {
    id
    title
    slug
    translation(language: $language) {     # wp-graphql-wpml
      slug
    }
    publicationFields {
      abstract
      publicationDate
      pdf { node { mediaItemUrl mediaDetails { filesize } } }
      authors { name affiliation }
      relatedPublications {
        nodes { ... on Publication { id title slug } }
      }
    }
    seo { title metaDesc opengraphImage { sourceUrl } }
  }
}
```

```typescript
// app/[locale]/(content)/publications/[slug]/page.tsx
export async function generateStaticParams() {
  const { publications } = await wpClient.request(GetAllPublicationSlugsDocument);
  return publications.nodes.flatMap(p => [
    { locale: 'ar', slug: p.slug },
    { locale: 'en', slug: p.translation?.slug ?? p.slug }
  ]);
}

export const revalidate = 3600; // Fallback hourly; on-demand revalidation is primary.

export default async function PublicationPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const { publication } = await wpClient.request(GetPublicationDocument, {
    slug,
    language: locale.toUpperCase()
  });
  if (!publication) notFound();
  return <PublicationTemplate data={publication} />;
}
```

### 7.3 Rendering strategy per route

| Route | Strategy | Reason |
|---|---|---|
| `/[locale]` (home) | SSG + on-demand ISR | Stable structure, content-driven |
| `/[locale]/<type>` (listings) | SSG + on-demand ISR + 1h fallback | Frequently updated, but cheap to regenerate |
| `/[locale]/<type>/[slug]` (detail) | SSG + on-demand ISR | Static unless content changes |
| `/[locale]/hero/[slug]` | SSG + on-demand ISR | Same |
| `/[locale]/search` | SSR | Dynamic, query-driven |
| `/api/*` | Server, never cached | |

No SSR for content. No client-side fetching of CMS content. If you find yourself reaching for `useEffect` to fetch content, stop and reconsider — push it to the server.

### 7.4 On-demand revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const { post_type, slug, lang } = await req.json();

  revalidatePath(`/${lang}/${post_type}/${slug}`);
  revalidatePath(`/${lang}/${post_type}`);
  revalidateTag('wp');

  return Response.json({ ok: true, revalidated: { post_type, slug, lang } });
}
```

WordPress fires this via a custom plugin hooked into `transition_post_status`:

```php
// mu-plugins/matmoora-revalidate.php
add_action('transition_post_status', function($new, $old, $post) {
  if ($new !== 'publish' && $old !== 'publish') return;
  wp_remote_post(MATMOORA_REVALIDATE_URL, [
    'headers' => ['x-revalidate-secret' => MATMOORA_REVALIDATE_SECRET],
    'body' => json_encode([
      'post_type' => $post->post_type,
      'slug' => $post->post_name,
      'lang' => apply_filters('wpml_post_language_details', null, $post->ID)['language_code'] ?? 'ar',
    ]),
    'timeout' => 5,
    'blocking' => false,
  ]);
}, 10, 3);
```

The same hook also pushes the post into Meilisearch (§12).

---

## 8. Preview Mode

Editors need to see drafts before publishing. Next.js Draft Mode does this.

```typescript
// app/api/preview/route.ts
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  const slug = url.searchParams.get('slug');
  const type = url.searchParams.get('type');
  const locale = url.searchParams.get('locale') ?? 'ar';

  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid', { status: 401 });
  }

  (await draftMode()).enable();
  return Response.redirect(`/${locale}/${type}/${slug}`);
}
```

Inside pages, branch on draft mode and use the authenticated WP client to fetch unpublished content.

---

## 9. Hero Pieces

Hero pieces are richer pages with custom interactivity. They are scoped in Phase 1; this section is a contract for *how* they slot into the system regardless of what they are.

### 9.1 Contract

Every hero piece is a component that:

1. Lives at `components/hero/<piece-name>/`.
2. Exports a default component matching the signature `(props: { data: HeroPieceData<T> }) => JSX.Element`.
3. Receives data from WordPress via a typed GraphQL query — no client-side fetching of content.
4. Has a server-rendered shell (SEO-visible content, fallback view) and a client-side enhancement layer (interaction).
5. Handles RTL deliberately. The piece's storyboard (Phase 2) must specify RTL behavior.
6. Has a mobile fallback that degrades gracefully if the interaction doesn't make sense on touch.
7. Carries its own `README.md` describing data shape, props, and how editors update it.

### 9.2 Pattern

```typescript
// components/hero/<piece-name>/index.tsx (server)
import { ClientPiece } from './piece.client';
import type { HeroPieceData } from './types';

export default function HeroPiece({ data }: { data: HeroPieceData }) {
  return (
    <section dir={data.locale === 'ar' ? 'rtl' : 'ltr'}>
      <noscript>
        <StaticFallback data={data} />
      </noscript>
      <ClientPiece data={data} />
    </section>
  );
}
```

```typescript
// components/hero/<piece-name>/piece.client.tsx
'use client';
// Animation libraries, refs, effects live here
```

### 9.3 Performance budget

Each hero piece must hit:

- Initial JS payload for the piece: <100 KB gzipped (excluding shared chunks).
- LCP impact on the host page: <500 ms additional.
- 60 FPS on a mid-range mobile (target: iPhone 12 / mid-range Android 2022+).
- Total page weight including media: <2 MB on mobile, <5 MB on desktop.

If a piece can't hit these, the design needs to be reconsidered, not the budget.

### 9.4 Library choices

Locked per-piece during build, not in advance. General preferences:

- Framer Motion for declarative React animations.
- GSAP for scroll-driven scene work (better timeline control).
- MapLibre GL for maps (open-source).
- Lottie for designer-produced animations.
- Chart.js for standard charts, D3 only when truly custom.

Avoid: anything that ships >150 KB for a single piece, anything with unclear license terms, anything that breaks under RTL without significant workaround.

---

## 10. SEO

### 10.1 Per-page

`generateMetadata` in every route, sourced from Yoast via WPGraphQL Yoast:

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publication } = await wpClient.request(GetPublicationSeoDocument, ...);
  return {
    title: publication.seo.title,
    description: publication.seo.metaDesc,
    openGraph: {
      images: publication.seo.opengraphImage?.sourceUrl,
      locale: locale === 'ar' ? 'ar_AR' : 'en_US',
    },
    alternates: {
      canonical: `/${locale}/publications/${slug}`,
      languages: {
        'ar': `/ar/publications/${arSlug}`,
        'en': `/en/publications/${enSlug}`,
      }
    }
  };
}
```

### 10.2 Sitemap

Generated by `app/sitemap.ts`, pulls all published posts from WP, includes both locales with `hreflang` alternates.

### 10.3 Robots

`app/robots.ts` — public in production, `Disallow: /` in staging. Driven by `NEXT_PUBLIC_ENV`.

### 10.4 Structured data

JSON-LD per page type. Publication → `ScholarlyArticle` or `CreativeWork` depending on Phase 1 decision. Injected as a `<script type="application/ld+json">` in the page component.

---

## 11. Performance

### 11.1 Baselines (must hit at launch)

| Metric | Target |
|---|---|
| LCP (mobile, 4G) | <2.5s |
| INP | <200ms |
| CLS | <0.1 |
| TTFB (edge) | <100ms |
| JS bundle (route average) | <150 KB gzipped |

### 11.2 Practices

- `next/image` for every image. WP domain whitelisted in `next.config.ts` `images.remotePatterns`.
- `next/font` for both Arabic and English fonts, with `display: swap`.
- Server components by default; client components only when interactive.
- No global state library. If state crosses two components, lift it; if it crosses ten, reconsider the design.
- No moment.js, no lodash full import. Use `date-fns` and per-function lodash imports.
- Suspense boundaries around any non-critical data fetch so streaming works.

### 11.3 Image handling

WordPress media URLs are remote (self-hosted CMS subdomain). Configure:

```typescript
// next.config.ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cms.matmoora.org' }
  ],
  formats: ['image/avif', 'image/webp'],
}
```

Editors are instructed (in the handover doc) to upload images at 2x intended display size, no larger.

---

## 12. Search

Search runs on Meilisearch, not WordPress. WP search is poor for Arabic; Meilisearch handles tokenization, typo tolerance, and synonyms well in both languages.

### 12.1 Topology

- Meilisearch runs as a container alongside WordPress on the same VPS.
- One index per (content_type × locale): `publications_ar`, `publications_en`, `articles_ar`, `articles_en`, etc.
- Indexed fields: `title`, `excerpt`, `body_text_extracted`, `tags`, `topics`, plus a small set of facet fields.

### 12.2 Indexing

A WordPress mu-plugin hooks `transition_post_status` and pushes the post to Meilisearch via its HTTP API. The same plugin handles delete (on `before_delete_post`) and unpublish (status transition out of `publish`).

```php
// mu-plugins/matmoora-search.php (sketch)
add_action('transition_post_status', function($new, $old, $post) {
  $client = new MeiliClient(MATMOORA_MEILI_HOST, MATMOORA_MEILI_ADMIN_KEY);
  $lang = apply_filters('wpml_post_language_details', null, $post->ID)['language_code'] ?? 'ar';
  $index = "{$post->post_type}_{$lang}";

  if ($new === 'publish') {
    $client->index($index)->addDocuments([build_search_document($post)]);
  } else if ($old === 'publish') {
    $client->index($index)->deleteDocument($post->ID);
  }
}, 20, 3);
```

A separate WP-CLI command (`wp matmoora reindex`) does a full rebuild from scratch (for first-run and recovery).

### 12.3 Frontend

```typescript
// app/api/search/route.ts — proxies to Meili with the search-only key
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const locale = req.nextUrl.searchParams.get('locale') ?? 'ar';
  const indexes = [`publications_${locale}`, `articles_${locale}`];

  const meili = new MeiliSearch({
    host: process.env.MEILI_HOST!,
    apiKey: process.env.MEILI_SEARCH_KEY!,   // search-only key, safe to use server-side
  });

  const results = await meili.multiSearch({
    queries: indexes.map(uid => ({ indexUid: uid, q, limit: 10 }))
  });

  return Response.json(results);
}
```

`/[locale]/search` page renders results with `<SearchBar>` (instant-search style) calling `/api/search`. Locale-scoped: searching on `/ar/search` only queries `*_ar` indexes.

### 12.4 Keys

- Admin key — known only by WordPress and stored in `wp-config.php` env. Used to index/delete.
- Search-only key — known by the Next.js API route. Cannot modify data. Generated once and rotated annually.
- Public-facing search calls go through `/api/search`, never directly to Meili from the browser, so the search key never enters client JS.

---

## 13. Forms

Forms are authored in WordPress (Fluent Forms preferred — lighter and faster than Gravity Forms; both are acceptable). The frontend renders them based on a schema fetched from WP, and submits back via a Next.js API route that proxies to WP's form endpoint.

### 13.1 Why this shape

- Editors create and edit forms in WP (familiar UI, no developer involvement for new forms).
- The frontend renders forms in our own components (consistent styling, RTL, accessibility, validation).
- Submissions still land in the WP form plugin's storage (entries, notifications, integrations all keep working).

### 13.2 Flow

```
WP form created in admin
       │
       ▼
GraphQL exposes form schema (fields, validation rules, labels)
       │
       ▼
Next.js fetches schema → renders with <FormRenderer>
       │
       ▼
User submits → POST /api/forms/[id]/submit
       │
       ▼
Next.js API route validates with Zod (from schema) → forwards to WP REST submission endpoint
       │
       ▼
WP plugin stores entry, fires notifications
```

### 13.3 Frontend

```typescript
// app/[locale]/contact/page.tsx
export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const schema = await wpClient.request(GetFormSchemaDocument, { id: 'contact' });
  return <FormRenderer schema={schema} locale={locale} action={`/api/forms/contact/submit`} />;
}
```

```typescript
// components/forms/FormRenderer.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemaToZod } from '@/lib/forms/schema-to-zod';

export function FormRenderer({ schema, locale, action }) {
  const zodSchema = useMemo(() => schemaToZod(schema), [schema]);
  const form = useForm({ resolver: zodResolver(zodSchema) });

  const onSubmit = async (data) => {
    await fetch(action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };
  // Render fields based on schema.fields, with locale-aware labels
}
```

### 13.4 Submission endpoint

```typescript
// app/api/forms/[id]/submit/route.ts
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  // Server-side re-validation against the same schema (don't trust the client)
  const schema = await wpClient.request(GetFormSchemaDocument, { id: params.id });
  const parsed = schemaToZod(schema).safeParse(data);
  if (!parsed.success) return Response.json({ ok: false, errors: parsed.error.format() }, { status: 400 });

  const wpResponse = await fetch(`${process.env.WP_BASE_URL}/wp-json/fluentform/v1/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ form_id: params.id, data: parsed.data }),
  });

  return Response.json({ ok: wpResponse.ok });
}
```

Spam protection: hCaptcha or Cloudflare Turnstile (Turnstile preferred — no user friction, free). Token verified server-side before forwarding to WP.

---

## 14. Comments

Native WP comments, moderated. Public reads via GraphQL; submissions via the same proxy pattern as forms.

### 14.1 Reads

```graphql
query GetPublicationComments($slug: ID!) {
  publication(id: $slug, idType: SLUG) {
    comments(first: 50, where: { order: ASC }) {
      nodes {
        id
        content
        date
        author { node { name } }
        parentId
      }
    }
  }
}
```

Server-rendered on the post detail page, included in the page's ISR cycle.

### 14.2 Submissions

```typescript
// app/api/comments/submit/route.ts
// POST { post_id, author_name, author_email, content, parent_id? }
// Server-side validation, Turnstile check, then POST to WP's comments REST endpoint.
// All new comments default to 'unapproved' status, await moderation.
```

WordPress's existing comment moderation tools (email notifications, admin queue) handle the editorial side. Once a comment is approved, the revalidation hook fires for the post's slug and the public page updates.

### 14.3 Spam

- Turnstile on the submit endpoint.
- WP Akismet plugin enabled.
- No anonymous comments without email; email is not displayed publicly.

---

## 15. Accessibility

Target: WCAG 2.1 AA.

- All interactive elements reachable by keyboard.
- Focus visible (don't disable outlines).
- `aria-label` for icon-only buttons, in the active locale.
- Color contrast: minimum 4.5:1 for body, 3:1 for large text.
- Hero pieces: provide a `prefers-reduced-motion` alternative for any animated content.
- Language switcher uses `<button>` with `aria-current="true"` for active locale.
- `lang` attribute on `<html>` reflects current locale.
- Form fields use real `<label for>` associations, not placeholder-as-label.

---

## 16. Self-Managed CMS Deployment

The CMS is self-hosted on a VPS. This section captures the deployment shape so it's reproducible.

> **Note:** A managed-WordPress alternative (e.g. Wevrlabs) is also supported.
> See `docs/HOSTING.md` for the side-by-side; on that path the Docker stack,
> `Caddyfile`, and `deploy.sh` become local-dev-only, and Meilisearch needs
> separate hosting.

### 16.1 Server requirements (baseline)

- VPS with 2 vCPU / 4 GB RAM minimum (Hetzner CPX21 or similar). Upgrade if Meilisearch grows.
- Ubuntu 22.04 LTS or 24.04 LTS.
- Docker + Docker Compose.
- Reverse proxy: Caddy (auto-HTTPS, simpler than Nginx + Certbot).
- UFW firewall: only 22, 80, 443 open externally. Meilisearch port (7700) bound to localhost only.

### 16.2 Container layout

```yaml
# matmoora-cms/docker-compose.yml (production)
services:
  db:
    image: mariadb:11
    restart: unless-stopped
    environment:
      MARIADB_DATABASE: wordpress
      MARIADB_USER: wp
      MARIADB_PASSWORD_FILE: /run/secrets/db_password
      MARIADB_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
    volumes:
      - db_data:/var/lib/mysql
    secrets: [db_password, db_root_password]

  wordpress:
    image: wordpress:6.5-php8.2-fpm-alpine
    restart: unless-stopped
    depends_on: [db]
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wp
      WORDPRESS_DB_NAME: wordpress
      WORDPRESS_CONFIG_EXTRA: |
        define('DISALLOW_FILE_EDIT', true);
        define('FORCE_SSL_ADMIN', true);
        define('MATMOORA_REVALIDATE_URL', getenv('MATMOORA_REVALIDATE_URL'));
        define('MATMOORA_REVALIDATE_SECRET', getenv('MATMOORA_REVALIDATE_SECRET'));
        define('MATMOORA_MEILI_HOST', getenv('MATMOORA_MEILI_HOST'));
        define('MATMOORA_MEILI_ADMIN_KEY', getenv('MATMOORA_MEILI_ADMIN_KEY'));
    volumes:
      - ./wp-content:/var/www/html/wp-content
      - wp_uploads:/var/www/html/wp-content/uploads

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on: [wordpress]

  meilisearch:
    image: getmeili/meilisearch:v1.10
    restart: unless-stopped
    environment:
      MEILI_ENV: production
      MEILI_MASTER_KEY_FILE: /run/secrets/meili_master_key
    volumes:
      - meili_data:/meili_data
    ports: ["127.0.0.1:7700:7700"]   # Localhost only
    secrets: [meili_master_key]

volumes: { db_data:, wp_uploads:, caddy_data:, caddy_config:, meili_data: }
secrets:
  db_password: { file: ./secrets/db_password }
  db_root_password: { file: ./secrets/db_root_password }
  meili_master_key: { file: ./secrets/meili_master_key }
```

### 16.3 Caddyfile

```caddy
cms.matmoora.org {
  reverse_proxy wordpress:9000 {
    transport fastcgi {
      root /var/www/html
    }
  }
  encode gzip zstd
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Frame-Options "SAMEORIGIN"
    Referrer-Policy "strict-origin-when-cross-origin"
  }
}
```

### 16.4 Backups

- **Database:** `mysqldump` runs nightly via cron in a sidecar container, output uploaded to off-site object storage (Backblaze B2 or Cloudflare R2). 30-day retention.
- **Uploads:** `restic` snapshots of `wp_uploads` volume, nightly, to same off-site target.
- **Configuration:** `docker-compose.yml`, `Caddyfile`, `wp-content/mu-plugins`, `wp-content/themes/matmoora-stub`, `acf-json/` all in `matmoora-cms` git repo. Secrets are NOT in git — kept in `secrets/` directory which is `.gitignore`d and provisioned separately.

### 16.5 Updates

- WordPress core: auto-updates enabled for minor versions only. Major versions are applied manually after testing in staging.
- Plugins: auto-updates enabled for all except WPGraphQL, WPML, WPGraphQL for ACF (these can break the schema; updated manually with a content-fetch smoke test after).
- Docker images: pinned to specific tags. Updated quarterly with explicit `docker compose pull` + restart.
- OS: `unattended-upgrades` for security patches.

### 16.6 Local dev

```yaml
# matmoora-cms/docker-compose.local.yml
services:
  db:
    image: mariadb:11
    environment:
      MARIADB_DATABASE: wordpress
      MARIADB_ROOT_PASSWORD: root
    volumes: [db_data:/var/lib/mysql]
  wordpress:
    image: wordpress:6.5-php8.2-apache
    ports: ["8080:80"]
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: root
      WORDPRESS_DB_PASSWORD: root
    volumes: [./wp-content:/var/www/html/wp-content]
  meilisearch:
    image: getmeili/meilisearch:v1.10
    environment: { MEILI_MASTER_KEY: dev-master-key }
    ports: ["7700:7700"]
volumes: { db_data: }
```

Frontend:

```bash
cd matmoora-web
pnpm install
cp .env.example .env.local
pnpm codegen
pnpm dev
```

---

## 17. Security

### 17.1 Frontend

- All env vars except `NEXT_PUBLIC_*` are server-only.
- The revalidation endpoint requires `x-revalidate-secret`.
- Preview mode requires `?secret=` query param matching `PREVIEW_SECRET`.
- Form submissions require Turnstile token, verified server-side.
- All form bodies re-validated server-side with Zod (never trust client validation).
- No user input rendered into HTML without sanitization. Rich text from WP comes through Yoast/WP's sanitized output; if rendering raw HTML, run through `isomorphic-dompurify` first.
- CSP header set in `next.config.ts` — restrictive by default, opened per-need.

### 17.2 WordPress

- 2FA enforced for all admin accounts (Wordfence or WP 2FA plugin).
- Editorial accounts use Editor role, not Administrator.
- `wp-config.php` constants for secrets, never committed.
- `DISALLOW_FILE_EDIT = true` so plugin/theme editing via admin is disabled.
- xmlrpc.php disabled at the Caddy level (returns 404).
- REST API user endpoints restricted (`rest_endpoints` filter, drop `users` for non-authenticated requests).
- Fail2ban on the host for SSH and Caddy access logs.
- Wordfence Free for WAF behavior at the WP layer.

### 17.3 Secrets management

| Secret | Where it lives |
|---|---|
| `WORDPRESS_GRAPHQL_ENDPOINT` | Vercel project env |
| `REVALIDATE_SECRET` | Vercel + WP server `.env` |
| `PREVIEW_SECRET` | Vercel + WP |
| `WP_PREVIEW_TOKEN` | Vercel |
| `MEILI_MASTER_KEY` | VPS docker secret |
| `MEILI_SEARCH_KEY` | Vercel project env (read-only key) |
| `TURNSTILE_SECRET` | Vercel + WP |
| DB passwords | VPS docker secrets |

Never commit `.env*` files except `.env.example`. Secrets on the VPS live in `secrets/` (file-mounted Docker secrets), git-ignored, provisioned manually or via SOPS-encrypted files in a separate private repo.

---

## 18. Deployment

### 18.1 Environments

| Environment | Frontend URL | CMS URL | Purpose |
|---|---|---|---|
| Local | `http://localhost:3000` | `http://localhost:8080` | Dev |
| Staging | `staging.matmoora.org` | `cms-staging.matmoora.org` | Pre-launch review |
| Production | `matmoora.org` | `cms.matmoora.org` | Live |

CMS subdomain. Production and staging on separate VPS instances or the same instance with isolated containers and DBs (depending on budget).

### 18.2 Frontend deployment

- GitHub → Vercel auto-deploy.
- `main` branch → production.
- All other branches → preview deployments per PR.
- Environment vars set per environment in Vercel.

### 18.3 CMS deployment

- `matmoora-cms` git repo contains compose files, Caddyfile, mu-plugins, theme stub, ACF JSON, deploy scripts.
- Deploy: `git pull && docker compose up -d --build` via a deploy script. Optionally automated via GitHub Actions with SSH.
- ACF field groups synced via JSON (`acf-json/` directory) — changes flow through git, not via UI in prod.
- Daily backups (§16.4) plus pre-deploy database snapshot.

---

## 19. Testing

Pragmatic, not exhaustive. This is a content site, not a critical-path application.

| Layer | Tool | Scope |
|---|---|---|
| Unit | Vitest | Pure utilities, formatters, i18n helpers, schema-to-zod |
| Component | React Testing Library | Hero piece components, FormRenderer, complex interactions |
| E2E | Playwright | Happy paths: home → listing → detail in both locales, search, form submission, comment submission, hero piece loads |
| Visual | Manual | Pre-launch QA across browsers / devices |
| Accessibility | axe-core via Playwright + manual | WCAG 2.1 AA target |

No CI gates blocking merges in the build phase. Add gates after launch when the codebase stabilizes.

---

## 20. Observability

| Concern | Tool | Notes |
|---|---|---|
| Frontend errors | Sentry | Free tier sufficient |
| Performance | Vercel Speed Insights + Web Vitals | Built in |
| Analytics | Deferred (see open questions) | |
| Uptime | Better Stack or UptimeRobot | Ping frontend root, `/api/health`, and CMS GraphQL endpoint |
| WordPress / VPS | Netdata or self-hosted Uptime Kuma | Container health, disk, memory |
| Meilisearch | `/health` endpoint scraped by the same uptime monitor | |

A `/api/health` route returns `200` if the WP GraphQL endpoint and Meilisearch both respond within 2s, else `503`.

---

## 21. Open Questions

These remain open and need answers during Phase 1 or shortly after:

1. **Hero pieces** — what they are, in what order they ship.
2. **Specific font choices** (Arabic + English) and licensing.
3. **Forms plugin** — Fluent Forms vs Gravity Forms (Fluent recommended; final pick during Phase 3).
4. **Number formatting** in Arabic context — Hindi numerals (٠١٢٣) vs Western (0123).
5. **Spam protection** — Turnstile recommended; Akismet license if going Gravity Forms route.
6. **Analytics** — tool, data residency, cookie banner requirements.
7. **Backup off-site target** — Backblaze B2, Cloudflare R2, or self-hosted MinIO.
8. **VPS provider** — Hetzner, DigitalOcean, Vultr, or other. Regional latency relevant.
9. **Whether to run staging on the same VPS as production** (cheaper) or separate (cleaner blast radius).

---

## 22. Change Log

| Date | Change | By |
|---|---|---|
| 2026-05-19 | Initial draft | — |
| 2026-05-19 | Phase 1 decisions applied: WPML, self-managed VPS, Arabic default, URL-based i18n, search/forms/comments in scope | — |
| 2026-05-20 | Hosted-WordPress (Wevrlabs) path added; Tailwind v4 CSS-first config; rate limiting layered on form/comment endpoints; production-only CSP/HSTS/Permissions-Policy; Sentry instrumentation; Fluent Forms set as default forms provider | — |
