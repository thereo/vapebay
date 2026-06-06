# --- Build stage: produce the Nuxt SSR output in .output/ ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# NUXT_PUBLIC_API_BASE must be set at build time for the client bundle to
# embed it. Override in the deploy job or via --build-arg.
ARG NUXT_PUBLIC_API_BASE=http://localhost:3001
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
RUN npm run build

# --- Runtime stage: Nitro server (node preset default) ---
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
