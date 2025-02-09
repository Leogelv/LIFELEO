import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { logger } from '@/utils/logger'

interface Contact {
  id: string
  name: string
  username?: string
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        logger.debug('Начинаем загрузку контактов')
        const { data, error } = await supabase
          .from('contacts')
          .select('id, name, username')
          .order('name')

        if (error) {
          logger.error('Ошибка при загрузке контактов', { error })
          return
        }

        logger.info('Контакты успешно загружены', { count: data?.length })
        setContacts(data || [])
      } catch (error) {
        logger.error('Неожиданная ошибка при загрузке контактов', { error })
      } finally {
        setIsLoading(false)
      }
    }

    fetchContacts()
  }, [])

  const getContactById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        logger.error('Ошибка при загрузке контакта', { error })
        return null
      }

      return data
    } catch (error) {
      logger.error('Неожиданная ошибка при загрузке контакта', { error })
      return null
    }
  }

  return { contacts, isLoading, getContactById }
} 