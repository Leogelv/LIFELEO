'use client'

import { ContactList } from '../components/ContactList'
import { SafeArea } from '../components/SafeArea'
import { BottomMenu } from '../components/BottomMenu'

export default function ContactsPage() {
  return (
    <>
      <SafeArea className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] text-[#E8D9C5]">
        <ContactList />
      </SafeArea>
      <BottomMenu />
    </>
  )
} 