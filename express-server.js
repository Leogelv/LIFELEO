const express = require('express');
const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Статические файлы из папки public
  server.use(express.static('public'));

  // API эндпоинт для проверки статуса
  server.get('/api/status', (req, res) => {
    res.json({ status: 'ok', server: 'express' });
  });

  // Обработка всех остальных запросов через Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Создаем HTTP сервер и слушаем порт
  createServer(server).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
}); 