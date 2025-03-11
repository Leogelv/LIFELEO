import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none'
  
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-600/50 disabled:text-white/70',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:bg-gray-700/70 disabled:text-gray-300/70',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-600/50 disabled:text-white/70'
  }
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  )
} 