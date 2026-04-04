FROM node:22-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generieren
RUN npx prisma generate

# Next.js Build
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3120

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public Assets
COPY --from=builder /app/public ./public

# Next.js Standalone Output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma

# Uploads-Ordner
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3120

CMD ["node", "server.js"]
