'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { logger } from '@/utils/logger'
import { useTelegram } from '@/app/hooks/useTelegram'

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onHabitAdded: () => void
}

// Категории привычек с дефолтными значениями
const habitCategories = [
  { 
    id: 'water', 
    name: 'Вода', 
    icon: 'solar:glass-water-bold', 
    defaultValue: 2000, 
    unit: 'мл',
    defaultAddValues: '100,200,300,500',
    defaultDelValues: '100,200'
  },
  { 
    id: 'sport', 
    name: 'Спорт', 
    icon: 'solar:running-round-bold', 
    defaultValue: 30, 
    unit: 'мин',
    defaultAddValues: '15,30,45,60',
    defaultDelValues: '15,30'
  },
  { 
    id: 'meditation', 
    name: 'Медитация', 
    icon: 'solar:meditation-bold', 
    defaultValue: 20, 
    unit: 'мин',
    defaultAddValues: '5,10,15,20',
    defaultDelValues: '5,10'
  },
  { 
    id: 'breathing', 
    name: 'Дыхание', 
    icon: 'solar:breathing-bold', 
    defaultValue: 10, 
    unit: 'мин',
    defaultAddValues: '3,5,7,10',
    defaultDelValues: '3,5'
  }
]

export function AddHabitModal({ isOpen, onClose, onHabitAdded }: AddHabitModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(habitCategories[0])
  const [targetValue, setTargetValue] = useState(habitCategories[0].defaultValue)
  const [repeatType, setRepeatType] = useState<'daily' | 'weekly'>('daily')
  const [timeOfDay, setTimeOfDay] = useState('09:00')
  const [isLoading, setIsLoading] = useState(false)
  const { safeAreaInset, isTelegramWebApp } = useTelegram()
  
  // Новые состояния для values_add, values_del и measure
  const [measureUnit, setMeasureUnit] = useState(habitCategories[0].unit)
  const [valuesAdd, setValuesAdd] = useState(habitCategories[0].defaultAddValues)
  const [valuesDel, setValuesDel] = useState(habitCategories[0].defaultDelValues)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Сброс формы при открытии
  const resetForm = () => {
    setSelectedCategory(habitCategories[0])
    setTargetValue(habitCategories[0].defaultValue)
    setRepeatType('daily')
    setTimeOfDay('09:00')
    setMeasureUnit(habitCategories[0].unit)
    setValuesAdd(habitCategories[0].defaultAddValues)
    setValuesDel(habitCategories[0].defaultDelValues)
    setShowAdvanced(false)
  }
  
  // Обновление значений при смене категории
  const handleCategoryChange = (category: typeof habitCategories[0]) => {
    setSelectedCategory(category)
    setTargetValue(category.defaultValue)
    setMeasureUnit(category.unit)
    setValuesAdd(category.defaultAddValues)
    setValuesDel(category.defaultDelValues)
  }

  // Создание привычки
  const handleSubmit = async () => {
    setIsLoading(true)
    logger.info('🎯 Создаем привычку', { 
      category: selectedCategory.id, 
      targetValue, 
      repeatType,
      timeOfDay,
      measureUnit,
      valuesAdd,
      valuesDel
    })

    try {
      const { error } = await supabase
        .from('habits')
        .insert({
          category: selectedCategory.id,
          name: selectedCategory.name,
          target_value: targetValue,
          repeat_type: repeatType,
          time_of_day: timeOfDay,
          measure: measureUnit,
          values_add: valuesAdd,
          values_del: valuesDel
        })

      if (error) throw error

      logger.info('✅ Привычка успешно создана')
      toast.success('Привычка создана!')
      onHabitAdded()
      onClose()
      resetForm()
    } catch (error) {
      logger.error('❌ Ошибка при создании привычки', { error })
      toast.error('Не удалось создать привычку')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{
            paddingTop: isTelegramWebApp ? `${safeAreaInset.top}px` : '16px',
            paddingBottom: isTelegramWebApp ? `${safeAreaInset.bottom}px` : '16px',
            paddingLeft: isTelegramWebApp ? `${safeAreaInset.left}px` : '16px',
            paddingRight: isTelegramWebApp ? `${safeAreaInset.right}px` : '16px'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-xl space-y-6 max-h-[90vh] overflow-y-auto"
            style={{
              padding: isTelegramWebApp ? 
                `${Math.max(16, safeAreaInset.top)}px ${Math.max(16, safeAreaInset.right)}px ${Math.max(16, safeAreaInset.bottom)}px ${Math.max(16, safeAreaInset.left)}px` : 
                '24px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-medium text-white">Новая привычка</h3>

            {/* Выбор категории */}
            <div className="grid grid-cols-2 gap-3">
              {habitCategories.map(category => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategoryChange(category)}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border transition-all duration-300
                    ${selectedCategory.id === category.id 
                      ? 'bg-white/10 border-white/20' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  <Icon icon={category.icon} className="w-6 h-6 text-white/80" />
                  <span className="text-white/80">{category.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Целевое значение */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">
                Целевое значение ({measureUnit})
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={e => setTargetValue(Number(e.target.value))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                  text-white/80 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Время дня */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">Время выполнения</label>
              <input
                type="time"
                value={timeOfDay}
                onChange={e => setTimeOfDay(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                  text-white/80 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Тип повторения */}
            <div className="space-y-2">
              <label className="text-sm text-white/60">Повторение</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRepeatType('daily')}
                  className={`
                    px-4 py-2 rounded-lg border transition-all duration-300
                    ${repeatType === 'daily' 
                      ? 'bg-white/10 border-white/20' 
                      : 'bg-white/5 border-white/10'
                    }
                  `}
                >
                  Ежедневно
                </button>
                <button
                  onClick={() => setRepeatType('weekly')}
                  className={`
                    px-4 py-2 rounded-lg border transition-all duration-300
                    ${repeatType === 'weekly' 
                      ? 'bg-white/10 border-white/20' 
                      : 'bg-white/5 border-white/10'
                    }
                  `}
                >
                  Еженедельно
                </button>
              </div>
            </div>
            
            {/* Расширенные настройки */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-2 flex items-center justify-center gap-2 
                rounded-lg bg-white/5 hover:bg-white/10 
                border border-white/10 text-white/80 transition-all duration-300"
            >
              <span>{showAdvanced ? 'Скрыть расширенные настройки' : 'Показать расширенные настройки'}</span>
              <Icon 
                icon={showAdvanced ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'} 
                className="w-5 h-5" 
              />
            </button>
            
            {/* Расширенные настройки (условный рендеринг) */}
            {showAdvanced && (
              <>
                {/* Единица измерения */}
                <div className="space-y-2">
                  <label className="text-sm text-white/60">Единица измерения</label>
                  <input
                    type="text"
                    value={measureUnit}
                    onChange={e => setMeasureUnit(e.target.value)}
                    placeholder="мл, мин, шт, км и т.д."
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                      text-white/80 focus:outline-none focus:border-white/20"
                  />
                </div>
                
                {/* Значения для кнопок добавления */}
                <div className="space-y-2">
                  <label className="text-sm text-white/60">
                    Значения для быстрого добавления 
                    <span className="text-white/40 ml-1">(через запятую)</span>
                  </label>
                  <input
                    type="text"
                    value={valuesAdd}
                    onChange={e => setValuesAdd(e.target.value)}
                    placeholder="100,200,300,500"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                      text-white/80 focus:outline-none focus:border-white/20"
                  />
                </div>
                
                {/* Значения для кнопок вычитания */}
                <div className="space-y-2">
                  <label className="text-sm text-white/60">
                    Значения для быстрого вычитания 
                    <span className="text-white/40 ml-1">(через запятую)</span>
                  </label>
                  <input
                    type="text"
                    value={valuesDel}
                    onChange={e => setValuesDel(e.target.value)}
                    placeholder="50,100,200"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                      text-white/80 focus:outline-none focus:border-white/20"
                  />
                </div>
              </>
            )}

            {/* Кнопки */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 
                  border border-white/10 text-white/80 transition-all duration-300"
              >
                Отмена
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 
                  border border-white/20 text-white font-medium transition-all duration-300"
              >
                {isLoading ? 'Создаем...' : 'Создать'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 