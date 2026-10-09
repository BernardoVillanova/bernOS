# ==========================================
# STAGE 1: Build frontend assets
# ==========================================
FROM oven/bun:1.2-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application source code (filtered strictly by .dockerignore)
COPY . .

# Build Vite/Vue frontend to /app/dist
RUN bun run build

# ==========================================
# STAGE 2: Ultra-lightweight Production Runner
# No node_modules required! server.ts uses native bun:sqlite, path, and fs.
# ==========================================
FROM oven/bun:1.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/bernos.db

# Prepare persistent data directory with proper non-root permissions
RUN mkdir -p /app/data && chown -R bun:bun /app

# Copy server entrypoint and compiled frontend
COPY --chown=bun:bun server.ts ./
COPY --from=builder --chown=bun:bun /app/dist ./dist

# Run as non-root unprivileged bun user
USER bun

EXPOSE 3000

# Built-in lightweight healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e 'fetch("http://localhost:3000/api/health").then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))'

CMD ["bun", "run", "server.ts"]
