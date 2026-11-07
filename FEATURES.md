# Features

## Read state
- Known globals: `__NEXT_DATA__`, `__NUXT__`, `__INITIAL_STATE__`,
  `__PRELOADED_STATE__`, `__APOLLO_STATE__`, `__remixContext`, plus a scan of
  other large `window` objects.
- Safe serialisation: cycle-safe, no functions, depth/item/string caps.

## Interesting
- Flags paths for role/isAdmin/permissions/plan/tier/tenant/org/features/
  flags/price/discount/email/apiKey/token and JWT-looking values.

## Routes & endpoints
- Hidden/interesting route strings and general paths from loaded same-origin
  scripts + inline scripts.
- `/api`, `/v\d`, `/graphql` endpoints and GraphQL operation names.

## Panel
- Tabs (Interesting / State / Routes / Endpoints) with a filter box; copy as Markdown.

## Safety
- Read-only; only scripts the page already loaded, same origin, no crawling.
- Results per tab in `chrome.storage.session`; scope-gated.
