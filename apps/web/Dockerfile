FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json ./package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/web/package-lock.json ./apps/web/package-lock.json

RUN npm ci --prefix apps/web

COPY apps/web ./apps/web

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NODE_ENV=production

RUN npm --prefix apps/web run build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/web ./apps/web

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]

