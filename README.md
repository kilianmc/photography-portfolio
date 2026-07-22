# photography-portfolio

A museum-quality photography-portfolio website — a showcase example in Kilian's
web-dev portfolio. The live example instance is **Laia** (laia.art.photo), a
Barcelona portrait/flower/light photographer.

Warm-gallery aesthetic, Catalan content with an auto-adapting multilingual UI,
portrait-first grids, and near-zero JavaScript.

## Stack

- **Astro 7** (static) + **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first; tokens in `src/styles/global.css`)
- **Markdown content collections** (`src/content.config.ts`, Zod)
- **`astro:assets`** for images · **Fontsource** self-hosted fonts (Fraunces + Inter)
- Deployed on **Cloudflare Pages**

## Develop

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # production build → dist/
npm run preview        # serve the build
npm run check          # astro check (type-check)
npm run format         # Prettier --write
```

> Adding content while the dev server runs and it doesn't show up? Restart the
> server (`npx astro dev stop && npx astro dev`) — the content-layer store can go
> stale.

## Content

- **Works** and **Collections** live as Markdown in `src/content/`; a collection
  with a `location`/`startDate` renders as an exhibition. Images go in
  `src/assets/`. See `CLAUDE.md` for the full model and conventions.
- **Content is Catalan;** only the UI chrome translates (CA/ES/EN/FR/DE/IT/PT via
  `src/i18n/`). `<html lang="ca">` is fixed.

## Deployment

Two-branch dev→prod flow: feature PRs → `dev`, promotion PRs `dev` → `main`.
Cloudflare Pages deploys `dev` to a dev URL and `main` to production. Baseline
version `1.0.0`; dev bumps minor, releases bump major.

See **`CLAUDE.md`** for full agent/contributor conventions.
