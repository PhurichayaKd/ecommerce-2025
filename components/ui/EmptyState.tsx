import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import Button from './Button'

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  size?: 'sm' | 'md' | 'lg'
}

const DefaultIcon = () => (
  <svg 
    className="w-12 h-12 text-gray-400" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={1.5} 
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" 
    />
  </svg>
)

export default function EmptyState({ 
  className,
  title,
  description,
  icon,
  action,
  size = 'md',
  ...props 
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  }
  
  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
  
  const titleSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className={clsx('mb-4', iconSizeClasses[size])}>
        {icon || <DefaultIcon />}
      </div>
      
      <h3 className={clsx(
        'font-semibold text-gray-900 mb-2',
        titleSizeClasses[size]
      )}>
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'primary'}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Pre-built empty state components for common scenarios
export const EmptySearch = ({ searchTerm, onClear }: { searchTerm: string; onClear?: () => void }) => (
  <EmptyState
    icon={
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="ไม่พบผลการค้นหา"
    description={`ไม่พบรายการที่ตรงกับ "${searchTerm}" ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง`}
    action={onClear ? {
      label: 'ล้างการค้นหา',
      onClick: onClear,
      variant: 'outline'
    } : undefined}
  />
)

export const EmptyCart = ({ onShop }: { onShop?: () => void }) => (
  <EmptyState
    icon={
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
      </svg>
    }
    title="ตะกร้าสินค้าว่าง"
    description="ยังไม่มีสินค้าในตะกร้า เริ่มเลือกซื้อสินค้าได้เลย"
    action={onShop ? {
      label: 'เลือกซื้อสินค้า',
      onClick: onShop
    } : undefined}
  />
)

export const EmptyProducts = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    }
    title="ยังไม่มีสินค้า"
    description="เริ่มต้นเพิ่มสินค้าแรกของคุณ"
    action={onAdd ? {
      label: 'เพิ่มสินค้า',
      onClick: onAdd
    } : undefined}
  />
)

export const EmptyError = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon={
      <svg className="w-12 h-12 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    }
    title="เกิดข้อผิดพลาด"
    description="ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง"
    action={onRetry ? {
      label: 'ลองใหม่',
      onClick: onRetry,
      variant: 'outline'
    } : undefined}
  />
)