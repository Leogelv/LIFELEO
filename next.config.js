/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем все оптимизации и проверки
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  swcMinify: false,
  
  // Отключаем экспериментальные функции
  experimental: {
    instrumentationHook: false,
  },
  
  // Для работы в dev режиме
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig; 