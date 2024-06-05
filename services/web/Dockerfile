# Use a small base image and multi-stage builds to reduce final image size
FROM node:20.2.0-alpine3.18 as base

# Install dependencies and build tools
FROM base as builder
WORKDIR /app
COPY package*.json ./
# Install all dependencies, including devDependencies for building
RUN npm ci

COPY . .
# Compile TypeScript to JavaScript
RUN npm run build
# Remove development dependencies to make the next steps faster
RUN npm prune --production

# Prepare production dependencies in a separate stage to minimize image size
FROM base as prod-deps
WORKDIR /app
COPY --from=builder /app/package*.json ./
# Install only production dependencies
RUN npm ci --production

# Final stage for the runtime environment
FROM base as runner
WORKDIR /app

# Setup a non-root user for security purposes
RUN addgroup --system --gid 1001 remix && \
    adduser --system --uid 1001 remix
USER remix

EXPOSE 3000

# Copy necessary files from previous stages
COPY --from=prod-deps --chown=remix:remix /app/package*.json ./

COPY --from=prod-deps --chown=remix:remix /app/node_modules ./node_modules
COPY --from=builder --chown=remix:remix /app/dist ./dist
COPY --from=builder --chown=remix:remix /app/public ./public

# Adjust the ENTRYPOINT to run the compiled JavaScript file
ENTRYPOINT ["npm", "run", "start"]
