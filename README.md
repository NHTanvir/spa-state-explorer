# SPA State Explorer

A Chrome (MV3) extension that reads a single-page app's **live JavaScript
state** and route table to surface what the client knows but doesn't show:
hidden routes (`/admin`, `/beta`, `/internal`), feature flags, your role/plan
values, other tenants' data shipped to the browser, and API endpoints.

> **Authorized testing only.** Read-only by default; it only fetches scripts
> the page already loaded (same origin, no crawling). State can hold personal
> data — results stay local. Empty scope = inert.

## Why not Burp
A proxy sees JS files as text. It can't read the running app's state (stores,
hydrated data, flags) or the resolved route table.

## Install (unpacked)
1. `chrome://extensions` → Developer mode → Load unpacked → this folder.
2. Options → add authorized host(s). Open the side panel from the toolbar.
3. **Read state** and **Scan routes** on an in-scope tab.

## Try it
```
cd testpages && python3 -m http.server 8000
```
Open `http://localhost:8000/next.html` with `localhost` in scope.

## Tests
```
npm test
```
See [FEATURES.md](FEATURES.md) and [PLAN.md](PLAN.md).
