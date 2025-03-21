const express = require('express');
const path = require('path');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app
  .prepare()
  .then(() => {
    const server = express();

    // Добавляем статический маршрут для файлов в директории public
    server.use('/public', express.static(path.join(__dirname, 'public')));

    // Маршрут для проверки статуса сервера
    server.get('/status', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });

    // Все остальные запросы передаем Next.js
    server.all('*', (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    server.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Сервер запущен на http://localhost:${PORT}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  }); 