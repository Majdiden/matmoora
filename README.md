# Matmoora

Bilingual (Arabic-default / English) headless content website.

This workspace holds two independently deployed projects:

| Directory | What it is | Deploys to |
|---|---|---|
| [`matmoora-web/`](./matmoora-web) | Next.js 15 frontend | Vercel |
| [`matmoora-cms/`](./matmoora-cms) | Headless WordPress CMS | Self-managed VPS (Docker) |

They have separate lifecycles and deploy independently — there is no monorepo
tooling layer between them (see `CLAUDE.md`).

## Documentation

- `CLAUDE.md` — working agreement (how to work in this repo).
- `docs/TECH_SPEC.md` — the technical specification (what to build).
- `docs/HOSTING.md` — deployment paths (hosted WordPress vs self-managed VPS).
- `.claude/skills/matmoora-build/` — the build skill.
- `docs/hero-pieces/` — one brief per hero piece (scoped in Phase 1).

## Status

Pre-Phase 1 scaffold. Both repos are bootstrapped with the architecture the
spec locks down. The content model, hero pieces, fonts, and forms provider are
deferred Phase 1 / Phase 3 decisions — see `docs/TECH_SPEC.md` §21.
