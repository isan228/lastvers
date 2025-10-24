#!/bin/bash

echo "🚀 Начинаем деплой Sherdoc KG..."

# Останавливаем приложение (если запущено)
pm2 stop sherdoc-kg 2>/dev/null || echo "Приложение не запущено"

# Обновляем код из GitHub
echo "📥 Обновляем код..."
git pull origin main

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Проверяем переменные окружения
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден. Создайте его на основе env.example"
    echo "cp env.example .env"
    echo "Затем отредактируйте .env с вашими настройками БД"
    exit 1
fi

# Запускаем приложение
echo "▶️  Запускаем приложение..."
pm2 start index.js --name "sherdoc-kg" --env production

# Сохраняем конфигурацию PM2
pm2 save

echo "✅ Деплой завершен!"
echo "🌐 Приложение доступно по адресу: http://your-domain.com"
echo "📊 Статус: pm2 status"
echo "📝 Логи: pm2 logs sherdoc-kg"
