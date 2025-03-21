const fs = require('fs');
const path = require('path');

console.log('🚀 Подготавливаю проект к деплою...');

// Путь к файлам
const originalGlobalsPath = path.join(__dirname, 'src', 'app', 'globals.css');
const deployGlobalsPath = path.join(__dirname, 'src', 'app', 'deploy-globals.css');
const backupGlobalsPath = path.join(__dirname, 'src', 'app', 'globals.css.bak');

// Создаем бэкап оригинальных стилей
console.log('📦 Создаю бэкап оригинальных стилей...');
fs.copyFileSync(originalGlobalsPath, backupGlobalsPath);

// Заменяем globals.css на версию для деплоя
console.log('🔄 Заменяю globals.css на версию для деплоя...');
const deployStyles = fs.readFileSync(deployGlobalsPath, 'utf8');
fs.writeFileSync(originalGlobalsPath, deployStyles);

// Отключаем tailwind и postcss
console.log('🛑 Отключаю tailwind и postcss...');

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [], // Пусто, чтобы не обрабатывать наши файлы
  theme: {
    extend: {},
  },
  plugins: [],
}`;

const postcssConfig = `module.exports = {
  plugins: {
    // Отключаем tailwindcss и autoprefixer
  },
}`;

fs.writeFileSync(path.join(__dirname, 'tailwind.config.js'), tailwindConfig);
fs.writeFileSync(path.join(__dirname, 'postcss.config.js'), postcssConfig);

console.log('✅ Проект готов к деплою!'); 