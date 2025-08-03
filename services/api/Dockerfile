# Stage 1: Build the application
FROM rust:1.81 as builder

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

# Build the application for x86_64
RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build --release --target x86_64-unknown-linux-musl

# Stage 2: Create the runtime image
FROM alpine:latest

RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/api .

EXPOSE 8080
CMD ["./api"]
