# CLAUDE.md — photography-portfolio

Guidance for AI agents (and humans) working in this repo. Read it before opening
a PR. (`CLAUDE.md` is a symlink to this file.)

## Overview

**`photography-portfolio`** is a museum-quality photography-portfolio website,
built as an example piece in Kilian's web-dev portfolio. The **live example
instance is Laia** (laia.art.photo), a Barcelona portrait/flower/light
photographer — the project name is deliberately generic, but the shipped content
is Laia's.

`PROJECT_SPEC.md` (in the workspace root, alongside this repo) is the planning
**source of truth**; `mockup.html` is the approved home-page mockup. When in
doubt about intent, defer to the spec.

The interface must disappear behind the artwork: warm, quiet, fast, accessible,
and almost maintenance-free.

## Stack

- **Astro 7** (static output) + **TypeScript** (strict). Type-check with
  `npm run check` (`astro check`), enforced in CI.
- **Tailwind CSS v4** — CSS-first via `@tailwindcss/vite`; design tokens live in
  `src/styles/global.css` (`@theme`). There is **no `tailwind.config` JS file**.
- **Markdown content collections** (Content Layer API, `glob` loader) with Zod
  schemas in `src/content.config.ts`.
- **`astro:assets`** for all images — responsive `srcset`/WebP, no Sharp config,
  no ImageMagick, no custom pipeline.
- **Self-hosted fonts** via Fontsource variable families (Fraunces + Inter),
  imported in `BaseLayout.astro`. No runtime Google Fonts.
- **Prettier** (with `prettier-plugin-astro`) for formatting; `format:check` runs
  in CI.
- Deployed on **Cloudflare Pages** (auto-deploy on push).
- **Node** per `.nvmrc` = `23.10.0` (`engines` floor: `>=22.12.0`).

## Project structure

```
src/
  styles/global.css      # Tailwind import + @theme design tokens + base styles
  layouts/BaseLayout.astro  # <html lang="ca">, meta/OG, ClientRouter, fonts, i18n script
  components/            # Header, Footer, Photo, WorkCard
  pages/                 # /, /works, /works/[slug], /collections, /collections/[slug], /about, /404
  content/
    works/               # one .md per photograph
    collections/         # one .md per collection/exhibition
    about.md             # single about/contact file (imported directly)
  content.config.ts      # Zod schemas (works, collections)
  i18n/                  # ca/es/en/fr/de/it/pt.json (UI chrome only) + ui.ts helper
  lib/collections.ts     # sortWorks, isExhibition, exhibitionStatus
  assets/                # committed web-export images (works/, collections/, portrait.jpg)
```

## Content model (see `content.config.ts`)

- **Works** — a single photograph (title, year, medium, optional dimensions/
  description, `collection` reference, `featured`, `draft`, `coverImage` +
  required `coverAlt`, optional `gallery`).
- **Collections** — a named body of work. A collection with `startDate`/
  `location` **also renders as an exhibition** (place + dates + Current/Past
  badge). There is **no separate Exhibitions type**.
- **About** — `src/content/about.md`, imported directly (not a collection); its
  frontmatter drives the About page + contact links.
- Required `alt` and the `draft` flag are enforced by schema. Keep frontmatter
  **flat and stable** — it's the real dependency for a future Decap CMS.

**Adding content:** drop images into `src/assets/…`, add a `.md` with matching
frontmatter. If new content doesn't appear in `npm run dev`, restart the dev
server — the content-layer store can go stale on files added while it runs.

## Internationalisation (UI chrome only)

- **Content stays Catalan.** Only interface strings are translated. `<html
lang="ca">` is fixed — no per-locale routes.
- UI strings live in `src/i18n/{lang}.json` (CA fallback; launch set CA/ES/EN/
  FR/DE/IT/PT). The page is server-rendered in Catalan; a small script in
  `BaseLayout.astro` swaps `[data-i18n]` text to the visitor's language
  (saved choice → browser → Catalan) and re-applies on `astro:page-load`.
- Adding a language = one JSON file + an entry in `src/i18n/ui.ts`.
- Do **not** add `data-i18n` to artwork/prose (that's content — keep it Catalan).

## Images

- Masters stay out of the repo. Commit web exports (~2500px, q90) to
  `src/assets/`. Render via `astro:assets` (`<Image>` / the `Photo` component).
- Embed IPTC/EXIF copyright metadata at export (photographer workflow) — the
  footer rights notice is a signal, not technical protection.

## Coding conventions

- Prefer `.astro` components; minimise shipped JS. Semantic HTML.
- Design tokens over hardcoded values: use `bg-bone`, `text-ink`,
  `text-terracotta`, `font-display`, `font-body`, and the `--color-*` / `--gutter`
  custom properties. Bespoke component chrome uses scoped `<style>`.
- Keep imports relative; no path aliases configured.
- `npm run format` before committing; `npm run check` must pass.

## Commands

```bash
npm install
npm run dev            # Astro dev server (http://localhost:4321)
npm run build          # production build to dist/ — must pass before PR
npm run preview        # serve the production build
npm run check          # astro check (type-check) — must pass before PR
npm run format         # Prettier --write
npm run format:check   # Prettier --check (what CI runs) — must pass before PR
```

CI (`.github/workflows/ci.yml`, job `check-build`) runs `npm ci` →
`format:check` → `check` → `build` on pushes/PRs to `dev` and `main`.

## Deployment (dev→prod)

- **Branches:** `dev` (integration) and `main` (production). Feature PRs target
  `dev`; `main` receives only `dev`→`main` promotion PRs.
- **Cloudflare Pages:** `dev` → dev URL, `main` → production. Build command
  `npm run build`, output dir `dist`.
- **Versioning:** baseline production = **1.0.0**. Dev iterations bump the
  **minor** (`npm run version:dev`); each production release bumps the **major**
  (`npm run version:release`).
- Kilian holds the merge gate and does a local/preview sign-off for UI changes.

## Git & PR conventions

- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
- **Branch naming** mirrors the type (`feat/…`, `fix/…`, …).
- One focused change per PR, targeting `dev`; include a preview and screenshots
  for visual changes.
