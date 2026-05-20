# Hero pieces

Hero pieces are richer pages with custom interactivity. Each lives under
`matmoora-web/components/hero/<slug>/` and is paired with a brief in this
directory: `docs/hero-pieces/<slug>.md`.

**A brief must exist before any code is written.** Inventing hero pieces
without a brief produces fake content that gets deleted later.

## Brief template

Copy the block below into `docs/hero-pieces/<slug>.md` and fill it out
**before** scaffolding the component.

```markdown
# <Hero piece name>

**Slug:** <slug-in-kebab-case>
**Owner:** <person>
**Status:** draft | in-progress | live
**Last updated:** <YYYY-MM-DD>

## What it is

One paragraph for an editor: what does a visitor see, why does it exist.

## Storyboard

Frame-by-frame description of the interaction. Include RTL behavior
explicitly — what flips, what doesn't, what the keyboard path is.

## Data

| Field | Type | Source (ACF / native / external) | Notes |
|---|---|---|---|

## Libraries

| Library | Used for | Bundle impact |
|---|---|---|

Stay under the per-piece budget in TECH_SPEC §9.3:
  - <100 KB gzipped initial JS (excluding shared chunks)
  - <500 ms LCP impact
  - 60 FPS on a mid-range mobile

## Mobile fallback

What renders on touch / when JS fails / when prefers-reduced-motion is on.

## Edit-ability

How does an editor change content / sequencing / numbers without a developer?

## Open questions
```

## Required of every hero piece

From the contract in TECH_SPEC §9.1:

1. Lives at `components/hero/<slug>/`
2. Default export with signature `(props: { data: HeroPieceData<T> }) => JSX.Element`
3. Receives data from WordPress via a typed GraphQL query (no client-side
   content fetching)
4. Has a server-rendered shell visible without JS + a client enhancement layer
5. Handles RTL deliberately (mirror the storyboard explicitly)
6. Has a mobile fallback for touch
7. Carries its own `README.md` describing data shape, props, and editor
   workflow

## What this folder will look like once Phase 1 lands

```
docs/hero-pieces/
├── README.md            (this file)
├── <piece-1>.md         (one brief per piece)
├── <piece-2>.md
└── ...
```

Each `<piece>.md` has its component sibling at
`matmoora-web/components/hero/<piece>/`.
