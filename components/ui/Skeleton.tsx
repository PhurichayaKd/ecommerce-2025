import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
  width?: string | number
  height?: string | number
}

export default function Skeleton({ 
  className, 
  variant = 'rectangular',
  animation = 'pulse',
  width,
  height,
  style,
  ...props 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded'
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: ''
  }

  const inlineStyles = {
    ...style,
    ...(width && { width }),
    ...(height && { height })
  }

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={inlineStyles}
      {...props}
    />
  )
}

// Pre-built skeleton components for common use cases
export const SkeletonText = ({ lines = 1, className, ...props }: { lines?: number } & SkeletonProps) => (
  <div className={clsx('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i}
        variant="text" 
        className={clsx(
          'h-4',
          i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
        )}
        {...props}
      />
    ))}
  </div>
)

export const SkeletonAvatar = ({ size = 40, className, ...props }: { size?: number } & SkeletonProps) => (
  <Skeleton 
    variant="circular" 
    width={size} 
    height={size}
    className={className}
    {...props}
  />
)

export const SkeletonButton = ({ className, ...props }: SkeletonProps) => (
  <Skeleton 
    variant="rectangular" 
    className={clsx('h-10 w-24 rounded-lg', className)}
    {...props}
  />
)

export const SkeletonCard = ({ className, ...props }: SkeletonProps) => (
  <div className={clsx('p-4 space-y-3', className)}>
    <Skeleton variant="rectangular" className="h-48 w-full" {...props} />
    <div className="space-y-2">
      <Skeleton variant="text" className="h-4 w-3/4" {...props} />
      <Skeleton variant="text" className="h-4 w-1/2" {...props} />
    </div>
  </div>
)

export const SkeletonTable = ({ 
  rows = 5, 
  columns = 4, 
  className, 
  ...props 
}: { 
  rows?: number
  columns?: number 
} & SkeletonProps) => (
  <div className={clsx('space-y-3', className)}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} variant="text" className="h-4" {...props} />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={`cell-${rowIndex}-${colIndex}`} 
            variant="text" 
            className="h-4" 
            {...props} 
          />
        ))}
      </div>
    ))}
  </div>
)