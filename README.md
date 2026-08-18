### AverageDB

The only database built from the ground for the average developer.

[https://averagedatabase.com](https://averagedatabase.com)

![logo](./services/web/public/logo.png)

### Hosting

The marketing site is a prerendered TanStack Start app. The Worker still
handles testimonial avatars and the request-dependent incident redirect, then
proxies `/api/*` to the Rust service on Railway. Disposable keys and values
live in SQLite on a volume; uploads live on the same disk.

### Support

Open an issue - we can't afford Slack yet until our vc check clears
