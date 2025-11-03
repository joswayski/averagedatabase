# Stage 1: Build the application
FROM rust:1.81 AS builder

# Install required tools for cross-compilation
RUN apt-get update && apt-get install -y musl-tools

WORKDIR /app

# Copy Cargo.toml and Cargo.lock first to leverage Docker cache
COPY Cargo.toml Cargo.lock ./

# Create an empty src directory to satisfy `cargo fetch`
RUN mkdir -p src && echo "// Placeholder" > src/main.rs

# Fetch dependencies
RUN cargo fetch

# Copy the rest of the source code
COPY . .

# Determine target architecture and build accordingly
ARG TARGETARCH
RUN case "$TARGETARCH" in \
    "amd64") \
        rustup target add x86_64-unknown-linux-musl && \
        cargo build --release --target x86_64-unknown-linux-musl && \
        cp target/x86_64-unknown-linux-musl/release/api /app/api \
        ;; \
    "arm64") \
        rustup target add aarch64-unknown-linux-musl && \
        cargo build --release --target aarch64-unknown-linux-musl && \
        cp target/aarch64-unknown-linux-musl/release/api /app/api \
        ;; \
    *) \
        echo "Unsupported architecture: $TARGETARCH" && exit 1 \
        ;; \
    esac

# Stage 2: Create the runtime image
FROM alpine:latest

RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/api .
# Copy the logo file
COPY src/avgdblogo.png ./src/

EXPOSE 8080
CMD ["./api"]
