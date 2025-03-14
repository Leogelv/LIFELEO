// noroutes.js - исключает маршруты из статического экспорта
// Этот файл используется для решения проблемы с экспортом страниц в Next.js

// Исключаем страницы из статического экспорта
export const excludedRoutes = [
  '/contacts',
  '/contacts/page',
  '/contacts/import',
  '/tasks',
  '/tasks/page'
];

// Функция для проверки маршрута на исключение
export function isExcludedRoute(path) {
  return excludedRoutes.some(route => path === route || path.startsWith(route + '/'));
} 