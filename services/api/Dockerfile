# Use an official Rust image as the builder
FROM rust:1.80 AS builder

# Set the working directory
WORKDIR /app

# Install dependencies for cross-compilation
RUN apt update && apt install -y musl-tools musl-dev

# Add the x86_64-unknown-linux-musl target for cross-compilation
RUN rustup target add x86_64-unknown-linux-musl

# Copy source code into the container
COPY ./ .

# Build the application for the x86_64 architecture
RUN cargo build --target x86_64-unknown-linux-musl --release

# Final stage: smaller runtime image
FROM debian:buster-slim

# Install minimal dependencies
RUN apt update && apt install -y ca-certificates && apt clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy CA certificates and built executable from the builder stage
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/api ./api

# Expose application port
EXPOSE 8080

# Command to run the application
CMD ["/app/api"]
