FROM node:18-alpine AS base

# 1. Устанавливаем зависимости
FROM base AS deps
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN npm ci

# 2. Сборка исходного кода
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Настраиваем переменные окружения
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Устанавливаем переменную, чтобы избежать проблем со сборкой
ENV NEXT_PUBLIC_BUILD_MODE docker
ENV NODE_OPTIONS=--openssl-legacy-provider

# Собираем проект (с модифицированной командой)
RUN npm run build

# Копируем статические файлы в standalone директорию
RUN cp -r public .next/standalone/ && \
    mkdir -p .next/standalone/.next/static && \
    cp -r .next/static .next/standalone/.next/

# 3. Создаем образ для запуска
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем standalone директорию целиком
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Убедимся, что у нас есть директория для статических файлов
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/public ./public

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Запускаем сервер
CMD ["node", "server.js"] 