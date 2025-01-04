'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'

interface HabitCardProps {
  icon: string
  title: string
  href: string
  gradient: string
}

export function HabitCard({ icon, title, href, gradient }: HabitCardProps) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden rounded-3xl aspect-[4/3] p-8 border border-[#E8D9C5]/10 bg-[#E8D9C5]/[0.02] backdrop-blur-sm hover:border-[#E8D9C5]/20 transition-all duration-500"
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient} blur-xl`} />
        <div className="relative z-10">
          <Icon icon={icon} className="w-12 h-12 text-[#E8D9C5] mb-4" />
          <h2 className="text-2xl text-[#E8D9C5]">{title}</h2>
        </div>
      </motion.div>
    </Link>
  )
} 