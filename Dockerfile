FROM node:18-alpine

WORKDIR /app

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--openssl-legacy-provider

# Копируем необходимые файлы
COPY package.json package-lock.json* ./
COPY next.config.js ./
COPY public ./public
COPY src ./src
COPY tsconfig.json ./

# Устанавливаем зависимости
RUN npm ci

# Собираем приложение
RUN npm run build

# Открываем порт
EXPOSE 3000

# Переменная для использования в запуске
ENV PORT=3000

# Напрямую запускаем сервер Next.js
CMD ["sh", "-c", "NODE_ENV=production NODE_OPTIONS=--openssl-legacy-provider node_modules/.bin/next start -p ${PORT}"] 