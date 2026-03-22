FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json ./package.json
COPY backend/package.json ./backend/package.json
COPY backend/package-lock.json ./backend/package-lock.json

RUN npm ci --prefix backend

COPY backend ./backend

ENV NODE_ENV=production

RUN npm --prefix backend run prisma:generate
RUN npm --prefix backend run build

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/backend ./backend

WORKDIR /app/backend

EXPOSE 3001

CMD ["node", "dist/main"]

