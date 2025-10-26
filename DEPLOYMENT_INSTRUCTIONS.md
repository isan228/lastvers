# 🚀 Инструкция по развертыванию Sherdoc на сервере

## 📋 Требования к серверу

- **ОС**: Ubuntu 20.04+ / Debian 11+
- **RAM**: Минимум 1GB, рекомендуется 2GB+
- **Диск**: Минимум 5GB свободного места
- **Сеть**: Доступ к интернету

## 🎯 Быстрое развертывание (рекомендуется)

### 1. Подключитесь к серверу
```bash
ssh root@your-server-ip
```

### 2. Скачайте и запустите скрипт
```bash
# Скачиваем скрипт
wget https://raw.githubusercontent.com/isan228/lastvers/main/deploy-to-server.sh

# Делаем исполняемым
chmod +x deploy-to-server.sh

# Запускаем развертывание
./deploy-to-server.sh
```

### 3. Проверьте статус
```bash
# Проверяем статус сервиса
sherdoc-manage status

# Смотрим логи
sherdoc-manage logs
```

## 🔧 Ручное развертывание

### 1. Обновите систему
```bash
apt update && apt upgrade -y
```

### 2. Установите необходимые пакеты
```bash
apt install -y curl wget git nginx postgresql postgresql-contrib nodejs npm
```

### 3. Настройте PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE sherdoc;
CREATE USER sherdoc_user WITH PASSWORD 'sherdoc_password';
GRANT ALL PRIVILEGES ON DATABASE sherdoc TO sherdoc_user;
\q
```

### 4. Скачайте проект
```bash
mkdir -p /var/www/sherdoc
cd /var/www/sherdoc
git clone https://github.com/isan228/lastvers.git .
```

### 5. Установите зависимости
```bash
npm install
```

### 6. Создайте .env файл
```bash
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sherdoc
DB_USER=sherdoc_user
DB_PASSWORD=sherdoc_password
PORT=4000
NODE_ENV=production
EOF
```

### 7. Настройте Nginx
```bash
cat > /etc/nginx/sites-available/sherdoc << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/sherdoc /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx
```

### 8. Создайте systemd сервис
```bash
cat > /etc/systemd/system/sherdoc.service << EOF
[Unit]
Description=Sherdoc Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/sherdoc
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sherdoc
systemctl start sherdoc
```

## 🎮 Управление приложением

### Команды управления
```bash
# Запуск
sherdoc-manage start

# Остановка
sherdoc-manage stop

# Перезапуск
sherdoc-manage restart

# Статус
sherdoc-manage status

# Логи
sherdoc-manage logs

# Обновление
sherdoc-manage update
```

### Прямые команды systemctl
```bash
# Запуск
systemctl start sherdoc

# Остановка
systemctl stop sherdoc

# Перезапуск
systemctl restart sherdoc

# Статус
systemctl status sherdoc

# Логи
journalctl -u sherdoc -f
```

## 🌐 Доступ к приложению

После развертывания приложение будет доступно по адресу:
- **Главная страница**: `http://your-server-ip/`
- **Вход для судей**: `http://your-server-ip/judge-login.html`
- **Табло 1**: `http://your-server-ip/scoreboard1.html`
- **Табло 2**: `http://your-server-ip/scoreboard2.html`
- **Табло 3**: `http://your-server-ip/scoreboard3.html`
- **Табло 4**: `http://your-server-ip/scoreboard4.html`

## 🔑 Данные для входа

- **Судья**: `judge` / `judge123`
- **Админ**: `admin` / `admin123`

## 🔧 Настройка SSL (опционально)

### Установка Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### Получение SSL сертификата
```bash
certbot --nginx -d your-domain.com
```

## 📊 Мониторинг

### Проверка статуса сервисов
```bash
systemctl status sherdoc nginx postgresql
```

### Просмотр логов
```bash
# Логи приложения
journalctl -u sherdoc -f

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Логи PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

## 🚨 Устранение неполадок

### Приложение не запускается
```bash
# Проверьте логи
journalctl -u sherdoc -n 50

# Проверьте порт
netstat -tlnp | grep 4000

# Проверьте права доступа
ls -la /var/www/sherdoc
```

### База данных недоступна
```bash
# Проверьте статус PostgreSQL
systemctl status postgresql

# Проверьте подключение
sudo -u postgres psql -c "SELECT 1;"
```

### Nginx не работает
```bash
# Проверьте конфигурацию
nginx -t

# Перезапустите Nginx
systemctl restart nginx
```

## 📝 Обновление приложения

```bash
# Обновление через скрипт
sherdoc-manage update

# Или вручную
cd /var/www/sherdoc
git pull origin main
npm install
systemctl restart sherdoc
```

## 🎯 Готово!

После выполнения всех шагов ваше приложение Sherdoc будет полностью развернуто и готово к использованию! 🎉
