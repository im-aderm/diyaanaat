FROM node:24-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG API_PROXY_TARGET

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
