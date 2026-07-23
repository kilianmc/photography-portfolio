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

## Production setup (one-time) — GitHub auth worker

Because the site is on Cloudflare Pages (not Netlify), GitHub login needs a tiny
auth worker: **[`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth)**.
It has no ongoing cost or maintenance.

**1. Deploy the worker.** From the `sveltia-cms-auth` repo, use its Cloudflare
"Deploy" button, or `git clone` it and run `wrangler deploy`. Note the resulting
URL: `https://sveltia-cms-auth.<SUBDOMAIN>.workers.dev`.

**2. Create a GitHub OAuth App** (GitHub → Settings → Developer settings → OAuth
Apps → New):

- **Application name:** `Photography Portfolio CMS` (anything)
- **Homepage URL:** `https://<your-site>.pages.dev`
- **Authorization callback URL:** `<YOUR_WORKER_URL>/callback`

Generate a client secret; copy the **Client ID** and **Client Secret**.

**3. Set the worker's environment variables** (Cloudflare → Workers →
`sveltia-cms-auth` → Settings → Variables):

| Variable               | Value                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| `GITHUB_CLIENT_ID`     | the Client ID from step 2                                              |
| `GITHUB_CLIENT_SECRET` | the Client Secret (tick **Encrypt**)                                   |
| `ALLOWED_DOMAINS`      | `<your-site>.pages.dev` (add the custom domain later, comma-separated) |

Redeploy the worker after adding them.

**4. Point the CMS at the worker.** In
[`public/admin/config.yml`](../public/admin/config.yml), replace the `base_url`
placeholder under `backend` with the worker URL from step 1:

```yaml
backend:
  name: github
  repo: <owner>/<repo>
  branch: main
  base_url: https://sveltia-cms-auth.<SUBDOMAIN>.workers.dev
```

Commit that to `main`. The editor can now go to `https://<your-site>.pages.dev/admin`,
click **Login with GitHub**, and publish.

> The editor needs write access to the repository (Collaborator) for their
> commits to succeed.

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
