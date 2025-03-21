FROM node:18-alpine

# Установка рабочей директории
WORKDIR /app

# Установка переменных окружения
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Копирование package.json и package-lock.json
COPY package.json package-lock.json* ./

# Установка зависимостей
RUN npm install

# Копирование файлов приложения
COPY . .

# Сборка приложения
RUN npm run build

# Открытие порта
EXPOSE 3000

# Запуск сервера
CMD ["node", "express-server.js"] 