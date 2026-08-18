# Average Database web

The marketing site is a TanStack Start application. Public pages are
prerendered to static HTML and served from Cloudflare. That is the right host
for a mostly-static site: more PoPs than Railway CDN.

The Worker only runs for:

- `/api/avatar/:handle`
- `/api/*`, proxied to the Rust API on Railway
- the April Fools incident redirect

Set `API_UPSTREAM` to the Railway API origin.

```bash
npm install
npm run typecheck
npm run build
npm run preview
```
