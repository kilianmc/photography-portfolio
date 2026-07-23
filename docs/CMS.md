# Content management (Sveltia CMS)

> **For the editor:** a plain-language, Catalan how-to lives in
> [`GUIA-CMS.ca.md`](GUIA-CMS.ca.md). This file is the technical/setup reference.

The artist edits the site through a git-based CMS —
**[Sveltia CMS](https://sveltiacms.app)**, a modern, Decap-compatible editor.
There is **no server and no database**: every change is committed to this
repository as a Markdown file (plus any uploaded image), exactly matching the
schemas in [`src/content.config.ts`](../src/content.config.ts). Cloudflare Pages
rebuilds on each commit and `astro:assets` optimises the images. Nothing about
the build changes.

The whole CMS is two static files served from the site:

- [`public/admin/index.html`](../public/admin/index.html) — loads Sveltia from a CDN.
- [`public/admin/config.yml`](../public/admin/config.yml) — maps the editing forms
  onto our content schema.

---

## Branching model — content goes straight to `main`

This repo normally uses **feature → `dev` → `main`** for code. **Content is the
exception:** the CMS `backend.branch` is **`main`**, so when the editor hits
_Publish_ the change commits to `main` and Cloudflare deploys it live. The editor
never runs a `dev` → `main` promotion — that would require developer access.

Because content lands on `main` directly, `main` will carry content commits that
`dev` doesn't have. Keep the two branches from drifting:

- **Code promotions `dev` → `main` are merges (not fast-forward)** so published
  content on `main` is preserved. (Never force-push or hard-reset `main`.)
- **Periodically back-merge `main` → `dev`** so developers pick up the real
  content (same pattern the other repos use after a release).

> Media/upload paths: each collection sets `media_folder` and `public_folder` to
> the **same relative path** (e.g. `../../assets/works`). That makes uploads land
> in `src/assets/…` and stores the frontmatter path as `../../assets/works/foo.jpg`
> — the relative form Astro's `image()` helper expects. Don't change one without
> the other.

---

## Local testing (no auth needed)

Sveltia has a **local-repository mode** (Chromium browsers, via the File System
Access API) — use it to try the forms against your working copy without touching
GitHub:

1. `npm run dev`
2. Open <http://localhost:4321/admin>
3. Click **"Work with Local Repository"** and pick this project's folder.
4. Create/edit a Work, Collection, or the About page. Saving writes real files
   into `src/content/…` and `src/assets/…` on disk.
5. Confirm the new `.md` references its image as `../../assets/…` and that
   `npm run build` still passes. Revert the test files when done.

This is the recommended way to sanity-check config changes before shipping.

---

## Authentication — GitHub personal access token (no worker, no setup)

Sveltia authenticates directly against GitHub with a **personal access token
(PAT)** entered in the browser — there is **no OAuth worker, no OAuth app, no
`base_url`, and no secrets** to deploy or maintain. This is why the config's
`backend` block has no `base_url`.

The only requirement: **each editor needs a GitHub account with write access
(Collaborator) to this repository.** Invite them under GitHub → the repo →
Settings → Collaborators.

Each editor signs in with **their own** account and **their own** token (commits
are authored as them), which they generate themselves in GitHub. On the `/admin`
login screen there are two buttons:

- **"Sign in with access token"** — the intended, self-contained path. It just
  prompts for a token (it does **not** auto-open GitHub or pre-select scopes), so
  create the token first (steps below) and paste it. Stored locally in that
  browser only.
- **"Sign in with GitHub"** — one-click OAuth, but with no `base_url` configured
  it routes through a **shared third-party** OAuth app (the Netlify-compatible
  default) we don't control. Avoid it; use the token.

**Create the token — fine-grained (recommended, tightest):** GitHub → _Settings →
Developer settings → Personal access tokens → Fine-grained tokens → Generate new
token_. Set **Resource owner** = the repo's owner, **Repository access** = _Only
select repositories_ → this repo, **Permissions → Repository → Contents: Read and
write** (Metadata read is added automatically), and **Expiration** = _No
expiration_ or the longest offered. Generate and copy the `github_pat_…` value.
_(Verified working 2026-07-23.)_

**Simpler fallback — classic token:** _Tokens (classic) → Generate new token
(classic)_ → tick the **`repo`** scope, _No expiration_.

**Token expiry.** With a long/no expiry the sign-in is effectively one-time
(stored per browser). When a token does expire, the editor just creates a new one
and signs in again.

> Because there is no shared infrastructure, this template works out of the box
> for any fork — no per-deployment auth setup.

---

## How the editor adds a photo

1. Go to `/admin` and log in with GitHub.
2. **Obres → New Obra.** Fill the title, year, technique; pick the collection
   from the dropdown; drag in the photo; write the alt text (required — it's how
   screen-reader users and search engines "see" the image).
3. _Featured_ shows it on the home page; _Esborrany_ (draft) keeps it hidden.
4. **Publish.** The site rebuilds and the photo is live in a minute or two.

> Every work belongs to a **collection**, so create the collection first
> (**Col·leccions → New**) if it doesn't exist yet. For one-off photos that
> aren't part of a series, keep a catch-all collection (e.g. _"Obra individual"_)
> and file them there — that way nothing is left uncategorised.

## Collections vs exhibitions

A **collection** is just a named group of works. It becomes an **exhibition**
automatically when you fill in its optional exhibition fields (labelled
_"Exposició · …"_): add a **place** and/or a **start date** and the collection
page then shows the location, the dates, and a **Current / Past** badge. Leave
those fields empty and it stays an ordinary collection. Nothing else to toggle —
the presence of the data _is_ the switch.
