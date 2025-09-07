import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'bg-white rounded-xl transition-all duration-200'
    
    const variantClasses = {
      default: 'border border-gray-200 shadow-soft',
      outlined: 'border border-gray-300',
      elevated: 'shadow-medium border border-gray-100',
      flat: 'border-0'
    }
    
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    }

    return (
      <div
        className={clsx(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card sub-components
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardHeader = ({ className, children, ...props }: CardHeaderProps) => (
  <div className={clsx('flex flex-col space-y-1.5 p-6 pb-0', className)} {...props}>
    {children}
  </div>
)

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export const CardTitle = ({ className, children, ...props }: CardTitleProps) => (
  <h3 className={clsx('text-lg font-semibold leading-none tracking-tight text-gray-900', className)} {...props}>
    {children}
  </h3>
)

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export const CardDescription = ({ className, children, ...props }: CardDescriptionProps) => (
  <p className={clsx('text-sm text-gray-600', className)} {...props}>
    {children}
  </p>
)

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardContent = ({ className, children, ...props }: CardContentProps) => (
  <div className={clsx('p-6 pt-0', className)} {...props}>
    {children}
  </div>
)

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardFooter = ({ className, children, ...props }: CardFooterProps) => (
  <div className={clsx('flex items-center p-6 pt-0', className)} {...props}>
    {children}
  </div>
)

export default Card