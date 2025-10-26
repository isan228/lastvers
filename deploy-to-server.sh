#!/bin/bash

# Скрипт для развертывания проекта Sherdoc на сервере
# Автор: AI Assistant
# Дата: $(date)

echo "🚀 Начинаем развертывание проекта Sherdoc..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверяем, что мы на сервере
if [ "$EUID" -ne 0 ]; then
    warn "Рекомендуется запускать скрипт от root пользователя"
fi

# Обновляем систему
log "Обновляем систему..."
apt update && apt upgrade -y

# Устанавливаем необходимые пакеты
log "Устанавливаем необходимые пакеты..."
apt install -y curl wget git nginx postgresql postgresql-contrib nodejs npm

# Проверяем версии
log "Проверяем установленные версии:"
node --version
npm --version
git --version
psql --version

# Создаем директорию для проекта
PROJECT_DIR="/var/www/sherdoc"
log "Создаем директорию проекта: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Клонируем репозиторий
log "Клонируем репозиторий с GitHub..."
git clone https://github.com/isan228/lastvers.git .

# Устанавливаем зависимости
log "Устанавливаем зависимости Node.js..."
npm install

# Настраиваем PostgreSQL
log "Настраиваем PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE sherdoc;"
sudo -u postgres psql -c "CREATE USER sherdoc_user WITH PASSWORD 'sherdoc_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sherdoc TO sherdoc_user;"

# Создаем файл окружения
log "Создаем файл .env..."
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sherdoc
DB_USER=sherdoc_user
DB_PASSWORD=sherdoc_password
PORT=4000
NODE_ENV=production
EOF

# Настраиваем Nginx
log "Настраиваем Nginx..."
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

# Активируем сайт
ln -sf /etc/nginx/sites-available/sherdoc /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Перезапускаем Nginx
systemctl restart nginx
systemctl enable nginx

# Создаем systemd сервис для Node.js приложения
log "Создаем systemd сервис..."
cat > /etc/systemd/system/sherdoc.service << EOF
[Unit]
Description=Sherdoc Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Перезагружаем systemd и запускаем сервис
systemctl daemon-reload
systemctl enable sherdoc
systemctl start sherdoc

# Проверяем статус
log "Проверяем статус сервисов..."
systemctl status sherdoc --no-pager
systemctl status nginx --no-pager

# Настраиваем firewall
log "Настраиваем firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Создаем скрипт для управления
log "Создаем скрипт управления..."
cat > /usr/local/bin/sherdoc-manage << 'EOF'
#!/bin/bash

case "$1" in
    start)
        systemctl start sherdoc
        echo "Сервис Sherdoc запущен"
        ;;
    stop)
        systemctl stop sherdoc
        echo "Сервис Sherdoc остановлен"
        ;;
    restart)
        systemctl restart sherdoc
        echo "Сервис Sherdoc перезапущен"
        ;;
    status)
        systemctl status sherdoc
        ;;
    logs)
        journalctl -u sherdoc -f
        ;;
    update)
        cd /var/www/sherdoc
        git pull origin main
        npm install
        systemctl restart sherdoc
        echo "Приложение обновлено"
        ;;
    *)
        echo "Использование: $0 {start|stop|restart|status|logs|update}"
        exit 1
        ;;
esac
EOF

chmod +x /usr/local/bin/sherdoc-manage

log "✅ Развертывание завершено!"
log "🌐 Приложение доступно по адресу: http://$(curl -s ifconfig.me)"
log "📊 Управление сервисом: sherdoc-manage {start|stop|restart|status|logs|update}"
log "📝 Логи: journalctl -u sherdoc -f"

echo ""
echo "🎯 Основные ссылки:"
echo "   - Главная: http://$(curl -s ifconfig.me)/"
echo "   - Вход для судей: http://$(curl -s ifconfig.me)/judge-login.html"
echo "   - Табло 1: http://$(curl -s ifconfig.me)/scoreboard1.html"
echo "   - Табло 2: http://$(curl -s ifconfig.me)/scoreboard2.html"
echo "   - Табло 3: http://$(curl -s ifconfig.me)/scoreboard3.html"
echo "   - Табло 4: http://$(curl -s ifconfig.me)/scoreboard4.html"
echo ""
echo "🔑 Данные для входа:"
echo "   - Судья: judge / judge123"
echo "   - Админ: admin / admin123"
