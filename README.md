### AverageDB

The only database built from the ground for the average developer.

[https://averagedatabase.com](https://averagedatabase.com)

![logo](./services/web/public/logo.png)

### Hosting

The marketing site is a prerendered TanStack Start app on Cloudflare. The
Worker handles testimonial avatars and the April Fools incident redirect, then
proxies `/api/*` to the Rust service on Railway. Keys and values live in an
in-memory LRU cache. ASS files live in a Railway bucket.

### Support

Open an issue - we can't afford Slack yet until our vc check clears
