FROM node:18-alpine

# Установка рабочей директории
WORKDIR /app

# Установка переменных окружения
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NEXT_DISABLE_HEALTHCHECK=1

# Копирование package.json и package-lock.json
COPY package.json package-lock.json* ./

# Установка зависимостей
RUN npm install

# Копирование файлов приложения
COPY . .

# Подготовка к деплою - заменяем стили на упрощенную версию
RUN cp src/app/deploy-globals.css src/app/globals.css

# Открытие порта
EXPOSE 3000

# Запуск сервера
CMD ["node", "express-server.js"] 