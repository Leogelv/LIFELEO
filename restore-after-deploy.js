const fs = require('fs');
const path = require('path');

console.log('🔄 Восстанавливаю проект после деплоя...');

// Путь к файлам
const originalGlobalsPath = path.join(__dirname, 'src', 'app', 'globals.css');
const backupGlobalsPath = path.join(__dirname, 'src', 'app', 'globals.css.bak');

// Проверяем, существует ли бэкап
if (fs.existsSync(backupGlobalsPath)) {
  // Восстанавливаем оригинальные стили
  console.log('📦 Восстанавливаю оригинальные стили...');
  fs.copyFileSync(backupGlobalsPath, originalGlobalsPath);
  fs.unlinkSync(backupGlobalsPath);
} else {
  console.log('⚠️ Бэкап не найден, пропускаю восстановление стилей.');
}

// Восстанавливаем конфигурации tailwind и postcss
console.log('🔄 Восстанавливаю конфигурации tailwind и postcss...');

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'gradient-slow': 'gradient 15s ease infinite',
        'gradient-slow-reverse': 'gradient-reverse 15s ease infinite',
        'wave': 'wave 7s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite',
        'wave-slow': 'wave 11s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-reverse': {
          '0%, 100%': { backgroundPosition: '100% 50%' },
          '50%': { backgroundPosition: '0% 50%' },
        },
        wave: {
          '0%': { backgroundPosition: '0 bottom' },
          '100%': { backgroundPosition: '-200% bottom' }
        }
      },
      backgroundSize: {
        '400%': '400% 400%',
      },
    },
  },
  plugins: [],
}`;

const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

fs.writeFileSync(path.join(__dirname, 'tailwind.config.js'), tailwindConfig);
fs.writeFileSync(path.join(__dirname, 'postcss.config.js'), postcssConfig);

console.log('✅ Проект восстановлен!'); 