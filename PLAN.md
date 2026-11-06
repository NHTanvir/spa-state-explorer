# SPA State Explorer — Plan

## Goal
Read a single-page app's **live JavaScript state** and route table to find what the client knows but doesn't show: hidden routes (`/admin`, `/beta`, `/internal`), feature flags, your role/plan values, other users' or tenants' data shipped to the browser, and API endpoints. Optionally flip flags **locally** to reveal gated UI.

**Roadmap fit:** business logic (spine #5 workflow, #6 price/plan logic), #3 BFLA (hidden admin routes), #4 multi-tenant (other tenants' data in state), Phase 5 framework internals.

**Why Burp can't:** Burp sees JavaScript files as text. It can't read the running app's state (stores, hydrated data, flags) or the router's resolved route table.

## Features
### v1 (MVP)
- **Known globals:** `__NEXT_DATA__`, `__NUXT__`, `__INITIAL_STATE__`, `__PRELOADED_STATE__`, `__APOLLO_STATE__`, `__remixContext`, `__sveltekit_*`, plus a scan of other `window` keys holding large objects.
- **Interesting values:** search the state for keys like role, isAdmin, permissions, plan, tier, tenant, orgId, features/flags, price, discount, email, apiKey/token.
- **Routes:** Next.js build manifest (`_buildManifest.js`), and route-like strings (`/admin/...`, `path: '...'`) found in loaded same-origin scripts.
- **Endpoints:** API paths and GraphQL operation names found in state and scripts.
- **Panel:** tabs for State (tree view with search), Interesting, Routes, Endpoints; copy as Markdown.
- Scope list; off elsewhere.

### Later
- **Local flag flip:** set a value in the live state (e.g. `features.beta = true`) and re-render where the framework allows — local only, to reveal gated UI to test with real requests.
- Diff state between two accounts (with Role UI Diff export format).

## Design
| File | Role |
|---|---|
| `manifest.json` | MV3. `storage`, `sidePanel`, `scripting`, `tabs`; host permissions per scope host. |
| `probe.js` | Content script in the **MAIN** world (on demand via `chrome.scripting.executeScript`): reads globals, safely serialises (depth/size limits, no functions, cycle-safe). |
| `routes.js` | Fetches same-origin script URLs already loaded by the page and extracts routes/endpoints with regexes. |
| `background.js` | Scope, runs the probe on request, stores results per tab in `chrome.storage.session`. |
| `panel.html/.js` | Side panel with the four tabs. |

## Safety and scope
- Read-only by default; flag flips (later) are local and explicit.
- Only fetches scripts the page already loaded, from the same origin; no crawling.
- In-scope hosts only. State may contain personal data — results stay local.

## Testing
- Test pages: a fake Next.js page with `__NEXT_DATA__` + build manifest, a Redux-style `__PRELOADED_STATE__` containing role/plan/flags, a script with hidden route strings.
- CDP + **error watcher**, 0 errors. Check: extraction, interesting-key hits, routes/endpoints, size limits on huge state, no effect on the page.

## Issues → commits
1. Scaffold: manifest, worker, scope
2. MAIN-world probe: known globals + safe serialisation
3. Interesting-key search
4. Route and endpoint extraction
5. Side panel with State / Interesting / Routes / Endpoints
6. Test pages + README/FEATURES/CLAUDE.md
