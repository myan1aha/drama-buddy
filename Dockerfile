# ============================================================
# Drama Buddy — Multi-stage Docker Build
# Stage 1: Install deps & build
# Stage 2: Production runtime (server + static TV assets)
# ============================================================

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# -------- Dependencies --------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
COPY apps/tv/package.json apps/tv/
RUN pnpm install --frozen-lockfile

# -------- Build --------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/apps/tv/node_modules ./apps/tv/node_modules
COPY . .

# Build shared package
RUN pnpm --filter @drama-buddy/shared build 2>/dev/null || true

# Build TV (static PWA)
RUN pnpm --filter @drama-buddy/tv build

# Build Server (Next.js)
RUN pnpm --filter @drama-buddy/server build

# -------- Production Runtime --------
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built server
COPY --from=builder /app/apps/server/.next ./apps/server/.next
COPY --from=builder /app/apps/server/public ./apps/server/public
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/apps/server/next.config.* ./apps/server/

# Copy built TV static assets
COPY --from=builder /app/apps/tv/dist ./apps/tv/dist

# Copy shared package
COPY --from=builder /app/packages/shared ./packages/shared

# Copy workspace config
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

# Data directory for SQLite
RUN mkdir -p /app/data
VOLUME /app/data

EXPOSE 3000

# Start server
WORKDIR /app/apps/server
CMD ["pnpm", "start"]
