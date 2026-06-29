# ==========================================
# STAGE 1: Build frontend assets
# ==========================================
FROM oven/bun:1.1-alpine AS builder
WORKDIR /app

# Copy dependency configs
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy application source code
COPY . .

# Build Vite/Vue frontend to /app/dist
RUN bun run build

# ==========================================
# STAGE 2: Run server and serve entire app
# ==========================================
FROM oven/bun:1.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy runtime files
COPY package.json bun.lock server.ts ./

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist
# Copy database file if it exists, or let it seed dynamically
COPY --from=builder /app/bernos.db* ./

# Expose port
EXPOSE 3000

# Start server
CMD ["bun", "run", "server.ts"]
