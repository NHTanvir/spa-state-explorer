# CLAUDE.md — SPA State Explorer

## What this is
MV3 Chrome extension that reads an SPA's live state + route table for hidden
routes/flags/roles/endpoints. Read-only. Authorized use only.

## Layout
- `manifest.json` — MV3; storage/sidePanel/scripting/tabs.
- `scope.js` — scope helpers (shared).
- `serialise.js` — PURE cycle/size-safe serialiser. Tested.
- `interesting.js` — PURE interesting-key/value search. Tested.
- `routes.js` — PURE route/endpoint extractors. Tested.
- `markdown.js` — PURE Markdown export. Tested.
- `probe.js` — injected MAIN-world function (self-contained, inlines a
  serialiser) reading known globals + window scan.
- `background.js` — scope-gated executeScript to run the probe and to fetch
  loaded same-origin scripts for route/endpoint scan; stores per tab.
- `panel.html` / `panel.js` — four-tab side panel (ES module).
- `testpages/` — fake Next.js page covering every tab.

## Rules
- Keep the four pure modules pure and Node-tested.
- Never inject before checking scope; never crawl — only already-loaded,
  same-origin scripts.

## Test
`npm test`; manual: serve `testpages/`, scope `localhost`.
