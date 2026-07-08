# roadmapped.work

The landing page for [Roadmapped](https://github.com/OWNER/roadmapped) — project
management as flat files. The site follows the same doctrine as the product:
static HTML and CSS, no build step, no framework, no external dependencies,
no fonts to download. Open `index.html` in a browser and that's the site.

## Files

- `index.html` — everything on the page (copy from `docs/site-copy.md` in the main repo)
- `style.css` — design tokens shared with the app (monochrome + one blue), light and dark via `prefers-color-scheme`
- `demo.js` — the hero demo loop; the final state is pre-rendered in the HTML, so the page works with JavaScript off and respects `prefers-reduced-motion`

## Deploy on Cloudflare Pages

1. Push this folder to a GitHub repo.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Build settings: **no build command** (leave empty), **output directory = `/`** (the root).
4. Add the custom domain `roadmapped.work`.

There's no step 5.

## Before deploying

Replace the GitHub placeholder with the real repo URL:

```bash
sed -i '' 's|github.com/OWNER/roadmapped|github.com/<owner>/<repo>|g' index.html README.md
```
