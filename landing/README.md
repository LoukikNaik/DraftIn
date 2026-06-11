# DraftIn landing page

Vite + React. No build step in CI — same convention as the rest of the repo.

## Dev

```bash
cd landing
npm install
npm run dev
```

## Build

```bash
npm run build      # → landing/dist
npm run preview    # serve dist locally
```

## Open Graph card

`src/OGCard.jsx` is the static 1200x630 social-preview design. To regenerate `public/og.png`:

1. In `src/main.jsx`, swap `<App />` for `<OGCard />`.
2. `npm run dev`, open the page in Chrome.
3. DevTools → Device Mode → 1200 × 630, DPR 2.
4. Toolbar `⋮` → Capture screenshot.
5. Save as `public/og.png` and revert `main.jsx`.

Until a real `og.png` is committed, the OG meta tags in `index.html` will 404 — preview cards on X/Slack/LinkedIn will fall back to the page title + description.
