'use client'

import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import Link from 'next/link'

interface Contact {
  id: number
  user_id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  created_at: string
}

interface ContactListProps {
  contacts: Contact[]
}

export function ContactList({ contacts }: ContactListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {contacts.map((contact) => (
        <motion.div
          key={contact.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 rounded-2xl backdrop-blur-sm border border-[#E8D9C5]/10 bg-[#E8D9C5]/[0.02]"
        >
          <Link href={`/contacts/${contact.user_id}`} className="flex items-center gap-4">
            {contact.photo_url ? (
              <img 
                src={contact.photo_url} 
                alt={contact.first_name} 
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#E8D9C5]/5 flex items-center justify-center">
                <Icon icon="solar:user-outline" className="w-6 h-6 text-[#E8D9C5]/60" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-[#E8D9C5]">
                {contact.first_name} {contact.last_name}
              </h3>
              {contact.username && (
                <p className="text-sm text-[#E8D9C5]/60">
                  @{contact.username}
                </p>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
} 