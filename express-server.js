const express = require('express');
const path = require('path');

// Настройки порта
const PORT = process.env.PORT || 3000;

// Создаем Express приложение
const app = express();

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Основной маршрут
app.get('/', (req, res) => {
  const now = new Date();
  const formattedDate = now.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LIFELEO</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #000;
          color: #fff;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }
        .menu {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }
        .menu-item {
          background-color: #1a1a1a;
          padding: 1rem;
          border-radius: 8px;
          transition: background-color 0.2s;
        }
        .menu-item:hover {
          background-color: #333;
        }
        .emoji {
          font-size: 1.5rem;
          margin-right: 0.5rem;
        }
        .footer {
          margin-top: 2rem;
          font-size: 0.9rem;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>LIFELEO</h1>
        <p>Добрый день!</p>
        <p>Приложение работает и запущено в режиме обслуживания.</p>
        <p>Основные функции временно недоступны.</p>
        
        <div class="menu">
          <div class="menu-item">
            <span class="emoji">📋</span> Задачи
          </div>
          <div class="menu-item">
            <span class="emoji">🔄</span> Привычки
          </div>
          <div class="menu-item">
            <span class="emoji">📝</span> Заметки
          </div>
          <div class="menu-item">
            <span class="emoji">👥</span> Контакты
          </div>
          <div class="menu-item">
            <span class="emoji">🤖</span> Голосовой бот
          </div>
        </div>

        <div class="footer">
          Последнее обновление: ${formattedDate}<br>
          Версия: Railway Express
        </div>
      </div>
    </body>
    </html>
  `);
});

// API endpoint для проверки статуса
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'maintenance',
    message: 'Сервер работает в режиме обслуживания'
  });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT} в режиме обслуживания`);
}); 