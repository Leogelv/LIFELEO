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

# Запускаем приложение
CMD ["npm", "start"] 