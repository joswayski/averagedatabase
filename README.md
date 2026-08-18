### AverageDB

The only database built from the ground for the average developer.

[https://averagedatabase.com](https://averagedatabase.com)

![logo](./services/web/public/logo.png)

### Hosting

One Rust process on Railway is the origin. It serves the prerendered
TanStack pages, live X avatar lookups, the April Fools redirect, and the
API. Keys and values live in an in-memory LRU cache. ASS files live in a
Railway bucket. Cache-Control is set per route so Cloudflare can orange-cloud
the hostname and honor those headers.

### Support

Open an issue - we can't afford Slack yet until our vc check clears
