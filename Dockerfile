FROM node:18-alpine

WORKDIR /app

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--openssl-legacy-provider

# Копируем необходимые файлы
COPY package.json package-lock.json* ./
COPY next.config.js ./
COPY express-server.js ./
COPY public ./public
COPY src ./src
COPY tsconfig.json ./

# Устанавливаем зависимости
RUN npm install

# Собираем приложение (статический экспорт)
RUN npm run build

# Копируем out директорию (результат статического экспорта) в публичную директорию Express
RUN mkdir -p public/out && cp -r out/* public/out || true

# Открываем порт
EXPOSE 3000

# Переменная для использования в запуске
ENV PORT=3000

# Запускаем наш Express сервер
CMD ["node", "express-server.js"] 