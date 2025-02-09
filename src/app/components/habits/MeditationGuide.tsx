'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/utils/supabase/client'

interface MeditationStats {
  totalHours: number
  averageDaily: number
}

interface Stage {
  id: number
  name: string
  description: string
  minHours: number
  technique: string
  tips: string[]
}

const meditationStages: Stage[] = [
  {
    id: 1,
    name: "Анапана: Начальный этап",
    description: "Наблюдение за естественным дыханием. Развитие осознанности и концентрации.",
    minHours: 0,
    technique: "Сфокусируйте внимание на области вокруг ноздрей и верхней губы. Наблюдайте за естественным дыханием, не пытаясь его контролировать.",
    tips: [
      "Сидите с прямой спиной",
      "Не меняйте дыхание",
      "При отвлечении мягко возвращайте внимание к дыханию",
      "Практикуйте минимум 2 раза в день"
    ]
  },
  {
    id: 2,
    name: "Анапана: Углубление практики",
    description: "Развитие более тонкого осознавания дыхания и ощущений.",
    minHours: 20,
    technique: "Продолжайте наблюдение за дыханием, постепенно сужая область внимания до меньшей точки между ноздрями и верхней губой.",
    tips: [
      "Отмечайте тонкие ощущения",
      "Развивайте непрерывность внимания",
      "Оставайтесь невозмутимыми при возникновении отвлечений"
    ]
  },
  {
    id: 3,
    name: "Введение в Випассану",
    description: "Начало практики сканирования тела и наблюдения за ощущениями.",
    minHours: 50,
    technique: "Систематически сканируйте тело часть за частью, наблюдая за любыми ощущениями с равностностью.",
    tips: [
      "Двигайтесь систематически",
      "Принимайте все ощущения",
      "Помните о непостоянстве",
      "Сохраняйте равностность"
    ]
  },
  {
    id: 4,
    name: "Випассана: Углубление практики",
    description: "Развитие более тонкого понимания непостоянства и пустотности.",
    minHours: 100,
    technique: "Продолжайте сканирование тела, развивая более глубокое понимание трех характеристик существования.",
    tips: [
      "Наблюдайте за изменчивостью ощущений",
      "Не создавайте привязанностей",
      "Развивайте понимание пустотности",
      "Практикуйте с усердием"
    ]
  },
  {
    id: 5,
    name: "Продвинутая практика",
    description: "Интеграция практики в повседневную жизнь и более глубокое понимание.",
    minHours: 200,
    technique: "Сочетайте формальную практику с осознанностью в повседневной жизни.",
    tips: [
      "Поддерживайте осознанность в течение дня",
      "Регулярно посещайте ретриты",
      "Изучайте Дхамму",
      "Делитесь заслугами с другими"
    ]
  }
]

export function MeditationGuide() {
  const [stats, setStats] = useState<MeditationStats | null>(null)
  const [currentStage, setCurrentStage] = useState<Stage | null>(null)

  useEffect(() => {
    const loadMeditationStats = async () => {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('value')
        .eq('category', 'meditation')
        .order('completed_at', { ascending: false })

      if (!error && data) {
        const totalMinutes = data.reduce((sum, log) => sum + log.value, 0)
        const totalHours = totalMinutes / 60
        const averageDaily = totalMinutes / 30 / 60 // среднее за последние 30 дней

        setStats({ totalHours, averageDaily })

        // Определяем текущий этап
        const stage = meditationStages.findLast(stage => totalHours >= stage.minHours)
        setCurrentStage(stage || meditationStages[0])
      }
    }

    loadMeditationStats()
  }, [])

  if (!stats || !currentStage) return null

  const nextStage = meditationStages.find(stage => stage.minHours > stats.totalHours)

  return (
    <div className="space-y-6 p-6 bg-zinc-900/50 rounded-2xl backdrop-blur-xl">
      {/* Текущий прогресс */}
      <div className="space-y-2">
        <h3 className="text-xl font-medium text-purple-400">Ваш путь в Випассане</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5">
            <div className="text-sm text-purple-400/60">Всего часов практики</div>
            <div className="text-2xl font-medium text-purple-400">{Math.round(stats.totalHours)}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <div className="text-sm text-purple-400/60">Среднее в день</div>
            <div className="text-2xl font-medium text-purple-400">
              {stats.averageDaily.toFixed(1)}ч
            </div>
          </div>
        </div>
      </div>

      {/* Текущий этап */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-purple-400">Текущий этап</h4>
          <span className="px-3 py-1 rounded-full bg-purple-400/20 text-purple-400 text-sm">
            {currentStage.name}
          </span>
        </div>
        
        <p className="text-white/60">{currentStage.description}</p>

        <div className="space-y-2">
          <h5 className="font-medium text-purple-400">Техника:</h5>
          <p className="text-white/80">{currentStage.technique}</p>
        </div>

        <div className="space-y-2">
          <h5 className="font-medium text-purple-400">Советы:</h5>
          <ul className="list-disc list-inside space-y-1 text-white/80">
            {currentStage.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Следующий этап */}
      {nextStage && (
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-purple-400">Следующий этап</h4>
          <div className="p-4 rounded-xl bg-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-purple-400">{nextStage.name}</span>
              <span className="text-sm text-purple-400/60">
                через {nextStage.minHours - Math.round(stats.totalHours)} часов
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-purple-400"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(stats.totalHours / nextStage.minHours) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 