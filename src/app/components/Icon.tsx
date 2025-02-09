import { Icon as IconifyIcon } from '@iconify/react'

interface IconProps {
  icon: string
  className?: string
}

export function Icon({ icon, className = '' }: IconProps) {
  return <IconifyIcon icon={icon} className={className} />
} 