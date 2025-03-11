'use client'

import { ContactList } from '../components/ContactList'
import { SafeArea } from '../components/SafeArea'
import { BottomMenu } from '../components/BottomMenu'
import Link from 'next/link'
import { Icon } from '@iconify/react'

export default function ContactsPage() {
  return (
    <>
      <SafeArea className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] text-[#E8D9C5]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2A2A2A]/50 hover:bg-[#2A2A2A] transition-colors"
            >
              <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
              <span>Назад</span>
            </Link>
            <h1 className="text-2xl font-bold">Контакты</h1>
            <div className="w-[76px]"></div>
          </div>
        </div>
        <ContactList />
      </SafeArea>
      <BottomMenu />
    </>
  )
} 