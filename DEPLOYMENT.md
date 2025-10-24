# 🚀 Инструкции по деплою Sherdoc KG

## 📋 Что нужно для деплоя

### 1. Серверные требования
- **Node.js** версии 18+ 
- **PostgreSQL** база данных
- **PM2** для управления процессами (рекомендуется)
- **Nginx** для прокси (опционально)

### 2. Установка на сервер

```bash
# 1. Клонируем репозиторий
git clone https://github.com/isan228/lastvers.git
cd lastvers

# 2. Устанавливаем зависимости
npm install

# 3. Настраиваем переменные окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками БД
```

### 3. Настройка базы данных

```bash
# Создайте базу данных PostgreSQL
createdb sherdoc_kg

# Или через psql:
psql -U postgres
CREATE DATABASE sherdoc_kg;
```

### 4. Переменные окружения (.env)

```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sherdoc_kg
DB_USER=your_username
DB_PASSWORD=your_password

# Порт приложения
PORT=4000

# Секретный ключ для сессий
SESSION_SECRET=your_secret_key_here
```

### 5. Запуск приложения

```bash
# Простой запуск
npm start

# Или с PM2 (рекомендуется для продакшена)
npm install -g pm2
pm2 start index.js --name "sherdoc-kg"
pm2 save
pm2 startup
```

### 6. Настройка Nginx (опционально)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Автоматический деплой

### Скрипт деплоя (deploy.sh)

```bash
#!/bin/bash
echo "🚀 Начинаем деплой Sherdoc KG..."

# Останавливаем приложение
pm2 stop sherdoc-kg || true

# Обновляем код
git pull origin main

# Устанавливаем зависимости
npm install

# Перезапускаем приложение
pm2 restart sherdoc-kg

echo "✅ Деплой завершен!"
```

## 📱 Проверка работоспособности

После деплоя проверьте:
- ✅ `https://sherdoc.kg` - главная страница
- ✅ `https://sherdoc.kg/sport-selection.html` - выбор видов спорта
- ✅ `https://sherdoc.kg/api/fighters` - API бойцов
- ✅ `https://sherdoc.kg/admin.html` - админ панель

## 🛠️ Полезные команды

```bash
# Просмотр логов
pm2 logs sherdoc-kg

# Перезапуск
pm2 restart sherdoc-kg

# Статус
pm2 status

# Обновление кода
git pull && pm2 restart sherdoc-kg
```

## 🔒 Безопасность

1. **Настройте файрвол**:
   ```bash
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```

2. **SSL сертификат** (Let's Encrypt):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs sherdoc-kg`
2. Проверьте статус БД: `systemctl status postgresql`
3. Проверьте порты: `netstat -tlnp | grep :4000`
