#!/bin/bash

# Быстрое развертывание Sherdoc
echo "🚀 Быстрое развертывание Sherdoc..."

# Устанавливаем Node.js и Git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs git

# Создаем директорию
mkdir -p /var/www/sherdoc
cd /var/www/sherdoc

# Клонируем проект
git clone https://github.com/isan228/lastvers.git .

# Устанавливаем зависимости
npm install

# Создаем .env файл
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sherdoc
DB_USER=postgres
DB_PASSWORD=postgres
PORT=4000
NODE_ENV=production
EOF

# Запускаем приложение
echo "✅ Приложение готово!"
echo "🌐 Запустите: node index.js"
echo "📱 Доступно на: http://localhost:4000"
