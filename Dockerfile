FROM node:18-alpine

# Установка рабочей директории
WORKDIR /app

# Установка переменных окружения
ENV NODE_ENV=production
ENV PORT=3000

# Копирование только необходимых файлов
COPY package.json package-lock.json* ./
COPY express-server.js ./
COPY public ./public

# Установка только необходимых зависимостей
RUN npm install express

# Открытие порта
EXPOSE 3000

# Запуск сервера
CMD ["node", "express-server.js"] 