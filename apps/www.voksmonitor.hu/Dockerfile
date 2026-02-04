# Build stage
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY turbo.json ./

# Copy workspace package.json files
COPY apps/www.voksmonitor.hu/package.json ./apps/www.voksmonitor.hu/
COPY packages/database/package.json ./packages/database/
COPY packages/design-system/package.json ./packages/design-system/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/next/package.json ./packages/next/
COPY packages/schema/package.json ./packages/schema/
COPY packages/app/package.json ./packages/app/

# Copy Prisma schema (needed for postinstall generate)
COPY packages/database/prisma ./packages/database/prisma

# Install dependencies
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app ./
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx turbo build --filter=www.voksmonitor.hu

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/apps/www.voksmonitor.hu/public ./apps/www.voksmonitor.hu/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/www.voksmonitor.hu/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/www.voksmonitor.hu/.next/static ./apps/www.voksmonitor.hu/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/www.voksmonitor.hu/server.js"]
