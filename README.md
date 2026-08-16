### AverageDB

The only database built from the ground for the average developer.

[https://averageatabase.com](https://averagedatabase.com)

![logo](./services/web/public/logo.png)

### Hosting

The frontend in `services/web` is a statically prerendered TanStack Start site
on Cloudflare Workers Static Assets. Only its API proxy and request-dependent
incident redirect invoke the Worker. The Rust API remains a separate service
until its Cloudflare migration is designed.

### Support

Open an issue - we can't afford Slack yet until our vc check clears
