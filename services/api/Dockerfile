# Use the Rust image as both builder and runtime
FROM rust:1.80

# Set the working directory
WORKDIR /app

# Copy the source code into the container
COPY ./ .

# Build the application in release mode
RUN cargo build --release

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["./target/release/api"]
