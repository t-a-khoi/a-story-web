# ─── A-Story Web | Dockerfile ──────────────────────────────────────────────────
# Multi-stage build: BASE → BUILD → PRODUCTION
# Usage:
#   docker build --build-arg BUILD_ENV=dev     -t a-story-web:dev .
#   docker build --build-arg BUILD_ENV=staging -t a-story-web:staging .
#   docker build --build-arg BUILD_ENV=prod    -t a-story-web:prod .

# ── Stage 1: BASE ─────────────────────────────────────────────────────────────
# Install dependencies only when needed
# Check status
FROM node:20-alpine AS BASE
LABEL author="a-story-web"

WORKDIR /app
COPY package.json package-lock.json ./
RUN apk add --no-cache git \
    && npm ci --frozen-lockfile \
    && npm cache clean --force

# ── Stage 2: BUILD ────────────────────────────────────────────────────────────
# Rebuild source code and select the correct .env file based on BUILD_ENV
FROM node:20-alpine AS BUILD
LABEL author="a-story-web"

WORKDIR /app

# Copy installed node_modules from BASE
COPY --from=BASE /app/node_modules ./node_modules

# Copy full source
COPY . .

# Build argument to select environment (dev | staging | prod)
ARG BUILD_ENV=staging
ENV BUILD_ENV=$BUILD_ENV
ENV NODE_ENV=production

RUN apk add --no-cache git \
    # Copy the corresponding .env.<BUILD_ENV> as .env.local for Next.js to pick up
    && cp .env.${BUILD_ENV} .env.local \
    # Build the Next.js app
    && npm run build \
    # Remove dev dependencies, keep only production ones
    && rm -rf node_modules \
    && npm ci --omit=dev --frozen-lockfile --ignore-scripts --prefer-offline

# ── Stage 3: PRODUCTION ───────────────────────────────────────────────────────
# Minimal production image — only what's needed to run the app
FROM node:20-alpine AS PRODUCTION
LABEL author="a-story-web"

WORKDIR /app
ENV NODE_ENV=production

COPY --from=BUILD /app/package.json /app/package-lock.json ./
COPY --from=BUILD /app/node_modules ./node_modules
COPY --from=BUILD /app/.next ./.next
COPY --from=BUILD /app/public ./public
COPY --from=BUILD /app/.env.local ./.env.local

EXPOSE 3000

CMD ["npm", "run", "start"]
