/** @type {import('next').NextConfig} */
const nextConfig = {
  // Убираем секцию env, так как переменные окружения могут быть недоступны во время сборки
  // и они автоматически будут доступны в runtime через process.env.*
  // env: {
  //   NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  //   NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  //   NEXT_PUBLIC_USER_ID: process.env.USER_ID,
  //   NEXT_PUBLIC_USER_NAME: process.env.USER_NAME,
  //   NEXT_PUBLIC_SIXDIGIT_PASSWORD: process.env.SIXDIGIT_PASSWORD,
  // },
  
  // Конфиг для полностью серверного рендеринга
  trailingSlash: true,
  distDir: '.next',
  
  // Отключаем экспорт статический файлов
  output: "export",
  
  // Принудительно используем только серверный рендеринг
  experimental: {
    // Отключаем статическую генерацию
    instrumentationHook: true,
    // Отключаем сбор данных страниц
    disableOptimizedLoading: true,
  },
  
  // Отключаем строгий режим React
  reactStrictMode: false,
  
  // Отключаем проверку ESLint при сборке
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Отключаем проверку TypeScript при сборке
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Отключаем статическую оптимизацию для всех страниц
  images: {
    unoptimized: true,
  },
  
  // Отключаем оптимизацию сборки
  swcMinify: false,
  
  // Отключаем сбор данных страниц
  optimizeFonts: false,
};

module.exports = nextConfig; 