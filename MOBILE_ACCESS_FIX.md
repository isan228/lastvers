# 📱 Исправление доступа с мобильных устройств

## 🚨 Проблема
Сайт не открывается на мобильных устройствах и показывает "подключение не защищено".

## 🔧 Быстрое исправление

### 1. На сервере выполните команды:

```bash
# Переходим в папку проекта
cd /var/www/sherdoc.kg

# Останавливаем nginx
sudo systemctl stop nginx

# Копируем HTTP-совместимую конфигурацию
sudo cp nginx-sherdoc-http.conf /etc/nginx/sites-available/sherdoc.kg

# Тестируем конфигурацию
sudo nginx -t

# Если тест прошел успешно, запускаем nginx
sudo systemctl start nginx

# Открываем порты в файрволе
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 4000

# Перезапускаем приложение
pm2 restart sherdoc-kg
```

### 2. Проверяем доступность:

```bash
# Проверяем статус сервисов
sudo systemctl status nginx
pm2 status

# Тестируем доступность
curl -I http://sherdoc.kg
curl -I http://localhost:4000
```

## 🌐 Адреса для доступа

После исправления сайт будет доступен по адресам:

- **http://sherdoc.kg** - основной адрес (через nginx)
- **http://sherdoc.kg:4000** - прямой доступ к приложению
- **http://[IP_АДРЕС_СЕРВЕРА]:4000** - по IP адресу сервера

## 📱 Тестирование на мобильных устройствах

1. Откройте браузер на телефоне
2. Перейдите по адресу: `http://sherdoc.kg`
3. Если не работает, попробуйте: `http://[IP_СЕРВЕРА]:4000`

## 🔍 Диагностика проблем

### Если сайт все еще не открывается:

```bash
# Проверяем логи nginx
sudo tail -f /var/log/nginx/sherdoc.kg.error.log

# Проверяем логи приложения
pm2 logs sherdoc-kg

# Проверяем, что порт 4000 открыт
netstat -tlnp | grep :4000

# Проверяем файрвол
sudo ufw status
```

### Если проблема с SSL:

```bash
# Временно отключаем принудительное перенаправление на HTTPS
# В файле /etc/nginx/sites-available/sherdoc.kg закомментируйте строки:
# return 301 https://$server_name$request_uri;
```

## 🚀 Автоматическое исправление

Запустите скрипт автоматического исправления:

```bash
cd /var/www/sherdoc.kg
chmod +x fix-mobile-access.sh
./fix-mobile-access.sh
```

## ✅ Результат

После выполнения этих действий:
- ✅ Сайт будет доступен по HTTP (без SSL)
- ✅ Мобильные устройства смогут открыть сайт
- ✅ Не будет ошибки "подключение не защищено"
- ✅ Все функции сайта будут работать

## 🔒 Настройка SSL (опционально)

Если хотите настроить SSL позже:

```bash
# Устанавливаем SSL сертификат
sudo certbot --nginx -d sherdoc.kg -d www.sherdoc.kg

# После этого сайт будет доступен и по HTTPS
```

