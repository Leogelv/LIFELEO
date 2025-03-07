/**
 * Утилиты для оптимизации производительности приложения
 */

// Оптимизация анимаций для слабых устройств
export const optimizeAnimations = (): boolean => {
  // Определяем, является ли устройство слабым
  const isLowEndDevice = () => {
    // Проверяем доступность API для определения характеристик устройства
    if ('deviceMemory' in navigator) {
      // @ts-ignore - deviceMemory не включен в стандартные типы
      return navigator.deviceMemory < 4; // Меньше 4GB RAM
    }
    
    // Проверяем количество логических процессоров
    if (navigator.hardwareConcurrency) {
      return navigator.hardwareConcurrency < 4; // Меньше 4 ядер
    }
    
    // Если не можем определить, предполагаем что это мобильное устройство
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  // Если устройство слабое, отключаем тяжелые анимации
  const isLowEnd = isLowEndDevice();
  
  if (isLowEnd) {
    // Добавляем класс для отключения тяжелых анимаций
    document.documentElement.classList.add('reduce-motion');
    
    // Устанавливаем CSS переменные для упрощения анимаций
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    document.documentElement.style.setProperty('--transition-duration', '0.1s');
  } else {
    // Для мощных устройств используем полные анимации
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
    document.documentElement.style.setProperty('--transition-duration', '0.3s');
  }
  
  return isLowEnd;
};

// Оптимизация рендеринга для слабых устройств
export const optimizeRendering = (): void => {
  // Отключаем ненужные эффекты для слабых устройств
  const isLowEnd = optimizeAnimations();
  
  if (isLowEnd) {
    // Уменьшаем качество теней
    document.documentElement.classList.add('reduce-shadows');
    
    // Отключаем сложные градиенты
    document.documentElement.classList.add('simple-gradients');
    
    // Уменьшаем прозрачность элементов (для ускорения композитинга)
    document.documentElement.classList.add('reduce-transparency');
  }
};

// Оптимизация изображений
export const optimizeImages = (): void => {
  // Отложенная загрузка изображений
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      // @ts-ignore - data-src не включен в стандартные типы
      img.src = img.dataset.src;
      img.setAttribute('loading', 'lazy');
      img.removeAttribute('data-src');
    });
  }
};

// Инициализация всех оптимизаций
export const initPerformanceOptimizations = (): void => {
  // Запускаем оптимизации после загрузки страницы
  if (typeof window !== 'undefined') {
    // Оптимизируем рендеринг (включает оптимизацию анимаций)
    optimizeRendering();
    
    // Оптимизируем изображения после полной загрузки страницы
    window.addEventListener('load', () => {
      optimizeImages();
    });
    
    // Отключаем ненужные обработчики событий при прокрутке
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      document.body.classList.add('is-scrolling');
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 200);
    }, { passive: true });
  }
}; 