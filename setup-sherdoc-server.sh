#!/bin/bash

echo "🚀 Настройка сервера для sherdoc.kg..."

# Обновляем систему
echo "📦 Обновляем систему..."
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js 18+
echo "📦 Устанавливаем Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Устанавливаем PostgreSQL
echo "📦 Устанавливаем PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y

# Устанавливаем Nginx
echo "📦 Устанавливаем Nginx..."
sudo apt install nginx -y

# Устанавливаем PM2
echo "📦 Устанавливаем PM2..."
sudo npm install -g pm2

# Устанавливаем Certbot для SSL
echo "📦 Устанавливаем Certbot..."
sudo apt install certbot python3-certbot-nginx -y

# Настраиваем PostgreSQL
echo "🗄️ Настраиваем базу данных..."
sudo -u postgres psql -c "CREATE DATABASE sherdoc_kg;"
sudo -u postgres psql -c "CREATE USER sherdoc_user WITH PASSWORD 'sherdoc_secure_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sherdoc_kg TO sherdoc_user;"

# Клонируем проект
echo "📥 Клонируем проект..."
cd /var/www
sudo git clone https://github.com/isan228/lastvers.git sherdoc.kg
sudo chown -R $USER:$USER /var/www/sherdoc.kg
cd /var/www/sherdoc.kg

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Создаем .env файл
echo "⚙️ Настраиваем переменные окружения..."
cat > .env << EOF
# База данных PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sherdoc_kg
DB_USER=sherdoc_user
DB_PASSWORD=sherdoc_secure_2024

# Порт приложения
PORT=4000

# Секретный ключ для сессий
SESSION_SECRET=sherdoc_kg_secret_key_2024_$(openssl rand -hex 32)

# Настройки для продакшена
NODE_ENV=production
EOF

# Настраиваем Nginx
echo "🌐 Настраиваем Nginx..."
sudo cp nginx-sherdoc-http.conf /etc/nginx/sites-available/sherdoc.kg
sudo ln -s /etc/nginx/sites-available/sherdoc.kg /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Тестируем конфигурацию Nginx
sudo nginx -t

# Запускаем приложение
echo "▶️ Запускаем приложение..."
pm2 start index.js --name "sherdoc-kg"
pm2 save
pm2 startup

# Настраиваем SSL
echo "🔒 Настраиваем SSL сертификат..."
sudo certbot --nginx -d sherdoc.kg -d www.sherdoc.kg --non-interactive --agree-tos --email admin@sherdoc.kg

# Перезапускаем Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Настраиваем файрвол
echo "🔒 Настраиваем файрвол..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Настройка завершена!"
echo "🌐 Ваш сайт будет доступен по адресу: https://sherdoc.kg"
echo "📊 Статус приложения: pm2 status"
echo "📝 Логи: pm2 logs sherdoc-kg"
echo "🔄 Перезапуск: pm2 restart sherdoc-kg"
