# roadmapped.work

The landing page for [Roadmapped](https://github.com/OWNER/roadmapped) — project
management as flat files. The site follows the same doctrine as the product:
static HTML and CSS, no build step, no framework, no external dependencies,
no fonts to download. Open `index.html` in a browser and that's the site.

## Files

- `index.html` — everything on the page (copy from `docs/site-copy.md` in the main repo)
- `style.css` — design tokens shared with the app (monochrome + one blue), light and dark via `prefers-color-scheme`
- `terminal.js` — the terminal window in the hero: a scripted replay of the agent loop (take → work → record). The full transcript is pre-rendered in the HTML, so the page works with JavaScript off and respects `prefers-reduced-motion`
- `demo/` — **the real dashboard**, embedded in the hero via an iframe. This is a pre-built, committed snapshot of the app's demo bundle: the actual React app with a read-only fetch shim and this page's own backlog baked in (`src/demo/` in the main repo). No build step on Cloudflare, no API — the bundle answers its own `/api/*` calls in-page

## Regenerating the demo snapshot

The `demo/` folder is a build artifact committed on purpose (the site deploys
with no build step). To refresh it after the app changes:

```bash
cd ../Roadmapped            # the main repo
npm run build:demo          # → dist-demo/ (validated demo tree, read-only shim)
rm -rf ../roadmapped-site/demo
cp -R dist-demo ../roadmapped-site/demo
```

The demo backlog itself lives in `src/demo/tree.ts` in the main repo and is
covered by the app's own validator in CI (`src/demo/tree.test.ts`) — if the
schema evolves, the test breaks there, not here.

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
