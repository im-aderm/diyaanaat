FROM node:24-alpine AS builder
WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .
RUN npx prisma generate
RUN npm run build

FROM node:24-alpine
WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p /app/uploads

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy; node dist/main"]
