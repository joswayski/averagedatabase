FROM node:22-bookworm AS web

WORKDIR /web
COPY services/web/package.json services/web/package-lock.json ./
RUN npm ci
COPY services/web ./
RUN npm run build

FROM rust:1-bookworm AS api

WORKDIR /app
COPY services/api/Cargo.toml services/api/Cargo.lock ./
COPY services/api/src ./src
RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=api /app/target/release/api /app/api
COPY --from=api /app/src/avgdblogo.png /app/src/avgdblogo.png
COPY --from=web /web/dist/client /app/static

ENV STATIC_DIR=/app/static
EXPOSE 8080
CMD ["./api"]
