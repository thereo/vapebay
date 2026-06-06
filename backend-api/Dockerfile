# --- Build stage: install deps + compile TypeScript to dist/ ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps with the lockfile so builds are reproducible.
COPY package.json package-lock.json ./
RUN npm ci

# Compile. nest build reads tsconfig.build.json → dist/.
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Prune devDependencies for the runtime image.
RUN npm prune --omit=dev

# --- Runtime stage: slim, no build tools ---
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001

# Only bring what we need to run.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

# Run the compiled JS — no ts-node in production.
CMD ["node", "dist/main.js"]
