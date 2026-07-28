# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_DISCOVERY_MODE=demo
ARG NEXT_PUBLIC_PRODUCT_SCAN_MODE=demo
ENV NEXT_PUBLIC_DISCOVERY_MODE=$NEXT_PUBLIC_DISCOVERY_MODE
ENV NEXT_PUBLIC_PRODUCT_SCAN_MODE=$NEXT_PUBLIC_PRODUCT_SCAN_MODE
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./data/lumen.db"
RUN mkdir -p data && npx prisma generate && npm run build

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL=file:/app/data/lumen.db

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs \
  && mkdir -p /app/data && chown -R nextjs:nodejs /app/data

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Prisma CLI needs engines; copy package metadata for resolution
COPY --from=builder /app/node_modules/@prisma/engines ./node_modules/@prisma/engines
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
