
# Builder stage using an official Rust image for AMD64
FROM --platform=linux/amd64 rust:1.76.0-bullseye AS builder


WORKDIR /app

# Cache dependencies by pre-building the application with an empty main file
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release --target x86_64-unknown-linux-gnu --locked


# Build the actual application
COPY ./ .
RUN touch src/main.rs && \
    cargo build --release --target x86_64-unknown-linux-gnu --locked

# Compress the executable using UPX - NOT WORKING ON x86_64
# RUN upx --best --lzma target/x86_64-unknown-linux-gnu/release/api

# Final stage uses distroless for minimal size
FROM --platform=linux/amd64 debian:bullseye-slim as final
COPY --from=builder /app/target/x86_64-unknown-linux-gnu/release/api /app/api

EXPOSE 8080

ENTRYPOINT ["/app/api"]
