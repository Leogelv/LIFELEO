const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

// Проверяем наличие статического экспорта
const hasStaticExport = fs.existsSync(path.join(__dirname, 'out'));

// Создаем сервер
const app = express();

// Статический путь для файлов в папке public
app.use(express.static(path.join(__dirname, 'public')));

// Если есть статический экспорт, используем его
if (hasStaticExport) {
  app.use(express.static(path.join(__dirname, 'out')));
  console.log('✅ Найден статический экспорт Next.js, используем его');
  
  // Все запросы маршрутизируем на index.html из экспорта
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'out', 'index.html'));
  });
} else {
  // Основной маршрут
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>LIFELEO - Сервер запущен</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .warning {
              color: #e74c3c;
              font-size: 0.9rem;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>LIFELEO</h1>
            <p>Сервер успешно запущен!</p>
            <p>Полная версия приложения будет доступна позднее.</p>
            <p class="warning">Внимание: Статический экспорт не найден.</p>
          </div>
        </body>
      </html>
    `);
  });
}

// Маршрут для проверки статуса
app.get('/status', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    staticExport: hasStaticExport
  });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Статический экспорт: ${hasStaticExport ? 'Да' : 'Нет'}`);
}); 