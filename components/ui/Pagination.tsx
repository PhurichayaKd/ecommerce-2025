import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import Button from './Button'

interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'minimal'
}

export default function Pagination({
  className,
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size = 'md',
  variant = 'default',
  ...props
}: PaginationProps) {
  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let startPage = Math.max(1, currentPage - halfVisible)
      let endPage = Math.min(totalPages, currentPage + halfVisible)
      
      // Adjust if we're near the beginning or end
      if (currentPage <= halfVisible) {
        endPage = maxVisiblePages
      } else if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push('...')
        }
      }
      
      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const buttonSize = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const
  }

  const visiblePages = getVisiblePages()

  if (totalPages <= 1) return null

  return (
    <nav
      className={clsx(
        'flex items-center justify-center space-x-1',
        sizeClasses[size],
        className
      )}
      aria-label="Pagination"
      {...props}
    >
      {/* First page button */}
      {showFirstLast && currentPage > 1 && (
        <Button
          variant={variant === 'minimal' ? 'ghost' : 'outline'}
          size={buttonSize[size]}
          onClick={() => onPageChange(1)}
          aria-label="Go to first page"
          className="hidden sm:inline-flex"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </Button>
      )}

      {/* Previous page button */}
      {showPrevNext && (
        <Button
          variant={variant === 'minimal' ? 'ghost' : 'outline'}
          size={buttonSize[size]}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline ml-1">ก่อนหน้า</span>
        </Button>
      )}

      {/* Page number buttons */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-1 text-gray-500"
              aria-hidden="true"
            >
              ...
            </span>
          )
        }

        const pageNumber = page as number
        const isActive = pageNumber === currentPage

        return (
          <Button
            key={pageNumber}
            variant={isActive ? 'primary' : (variant === 'minimal' ? 'ghost' : 'outline')}
            size={buttonSize[size]}
            onClick={() => onPageChange(pageNumber)}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
            className={clsx(
              'min-w-[2.5rem]',
              isActive && 'pointer-events-none'
            )}
          >
            {pageNumber}
          </Button>
        )
      })}

      {/* Next page button */}
      {showPrevNext && (
        <Button
          variant={variant === 'minimal' ? 'ghost' : 'outline'}
          size={buttonSize[size]}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline mr-1">ถัดไป</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      )}

      {/* Last page button */}
      {showFirstLast && currentPage < totalPages && (
        <Button
          variant={variant === 'minimal' ? 'ghost' : 'outline'}
          size={buttonSize[size]}
          onClick={() => onPageChange(totalPages)}
          aria-label="Go to last page"
          className="hidden sm:inline-flex"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </Button>
      )}
    </nav>
  )
}

// Simple pagination info component
interface PaginationInfoProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  className?: string
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={clsx('text-sm text-gray-600', className)}>
      แสดง {startItem.toLocaleString()}-{endItem.toLocaleString()} จาก {totalItems.toLocaleString()} รายการ
      {totalPages > 1 && (
        <span className="ml-2">
          (หน้า {currentPage} จาก {totalPages})
        </span>
      )}
    </div>
  )
}

// Combined pagination with info
interface PaginationWithInfoProps extends PaginationProps {
  totalItems: number
  itemsPerPage: number
  showInfo?: boolean
  infoPosition?: 'top' | 'bottom' | 'both'
}

export function PaginationWithInfo({
  totalItems,
  itemsPerPage,
  showInfo = true,
  infoPosition = 'bottom',
  className,
  ...paginationProps
}: PaginationWithInfoProps) {
  const info = showInfo && (
    <PaginationInfo
      currentPage={paginationProps.currentPage}
      totalPages={paginationProps.totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
    />
  )

  return (
    <div className={clsx('space-y-4', className)}>
      {(infoPosition === 'top' || infoPosition === 'both') && info}
      <Pagination {...paginationProps} />
      {(infoPosition === 'bottom' || infoPosition === 'both') && info}
    </div>
  )
}