#!/bin/bash

# Скрипт для сборки Docker-образа с обходом проблем статического экспорта

# Устанавливаем переменные окружения
export NEXT_PUBLIC_BUILD_MODE=docker
export NODE_OPTIONS=--openssl-legacy-provider

# Сначала удаляем директорию .next для чистой сборки
echo "🧹 Cleaning previous build..."
rm -rf .next

# Собираем Docker-образ
echo "🔧 Building Docker image..."
docker build -t lifeleo-app .

# Если сборка успешна, запускаем контейнер для тестирования
if [ $? -eq 0 ]; then
  echo "✅ Build successful! Starting container..."
  docker run -p 3000:3000 lifeleo-app
else
  echo "❌ Build failed!"
fi 