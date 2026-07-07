# Frontend Development Log

## 2026-07-07

### Decision

Use the 2D approach: a small Vite frontend app that bundles Markdown at build time and emits relative asset paths.

### Why

- Development can use a normal frontend workflow: `npm run dev`.
- The final output can be opened from `dist/index.html` because the build inlines the JavaScript and CSS into that file.
- Markdown files are imported with `import.meta.glob` and `?raw`, so the browser does not need to fetch local `.md` files after the app is built.
- This keeps the current learning-material structure: Markdown remains the source of truth.

### Current Workflow

```bash
npm install
npm run dev
npm run build
npm run verify
```

### Verification Notes

- `npm run build` emits a small single-page static app under `dist/`, then runs `scripts/inline-dist-assets.mjs`.
- `npm run verify` checks that `dist/index.html` inlines CSS and JavaScript instead of referencing external module assets.
- Browser automation verified the Vite development page and the Objective-C property document route.
- Direct `file://` browser automation was blocked by the browser-control policy, so the file-openable claim is verified by build output structure and relative asset checks.

### Key Files

- `package.json`: npm scripts and dependencies.
- `vite.config.js`: Vite configuration, including relative asset paths.
- `index.html`: Vite HTML entry.
- `src/main.js`: imports Markdown, renders navigation, search, table of contents, and the reader.
- `src/styles.css`: visual layout for the learning app.
- `tests/verify-static-app.mjs`: lightweight verification script for the app shape and build output.
