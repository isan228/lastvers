#!/bin/bash

echo "🔧 Исправляем доступ с мобильных устройств..."

# 1. Останавливаем nginx
echo "⏹️ Останавливаем nginx..."
sudo systemctl stop nginx

# 2. Копируем HTTP-совместимую конфигурацию
echo "📝 Устанавливаем HTTP-совместимую конфигурацию nginx..."
sudo cp nginx-sherdoc-http.conf /etc/nginx/sites-available/sherdoc.kg

# 3. Тестируем конфигурацию
echo "🧪 Тестируем конфигурацию nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Конфигурация nginx корректна"
    
    # 4. Перезапускаем nginx
    echo "🔄 Перезапускаем nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # 5. Проверяем статус
    echo "📊 Проверяем статус сервисов..."
    sudo systemctl status nginx --no-pager
    pm2 status
    
    # 6. Открываем порты в файрволе
    echo "🔓 Настраиваем файрвол..."
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw allow 4000
    sudo ufw --force enable
    
    echo ""
    echo "✅ Исправления применены!"
    echo "🌐 Сайт теперь доступен по адресам:"
    echo "   - http://sherdoc.kg (основной)"
    echo "   - http://sherdoc.kg:4000 (прямой доступ к приложению)"
    echo "   - https://sherdoc.kg (если SSL настроен)"
    echo ""
    echo "📱 Теперь сайт должен открываться на мобильных устройствах!"
    echo ""
    echo "🔍 Для проверки используйте:"
    echo "   - curl -I http://sherdoc.kg"
    echo "   - pm2 logs sherdoc-kg"
    echo "   - sudo nginx -t"
    
else
    echo "❌ Ошибка в конфигурации nginx!"
    echo "Проверьте файл: /etc/nginx/sites-available/sherdoc.kg"
    exit 1
fi

