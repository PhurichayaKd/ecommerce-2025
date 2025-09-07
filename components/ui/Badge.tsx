import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import styles from './Badge.module.css'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Badge({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: BadgeProps) {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[variant],
        styles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}