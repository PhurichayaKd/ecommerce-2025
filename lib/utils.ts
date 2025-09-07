import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Product, CartItem, LocalStorageCart } from './types'

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Price formatting utilities
export const formatPrice = (price: number, currency: string = 'THB'): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('th-TH').format(num)
}

export const formatTHB = (amount: number): string => {
  return formatPrice(amount, 'THB')
}

export const isLowStock = (stock: number): boolean => {
  return stock < 10
}

// Date formatting utilities
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Bangkok'
  }
  
  return new Intl.DateTimeFormat('th-TH', { ...defaultOptions, ...options }).format(dateObj)
}

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'เมื่อสักครู่'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} นาทีที่แล้ว`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ชั่วโมงที่แล้ว`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} วันที่แล้ว`
  }
  
  return formatDate(dateObj)
}

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-') // Allow Thai characters
    .replace(/^-+|-+$/g, '')
}

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Array utilities
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key]
    const bValue = b[key]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc' 
        ? aValue.localeCompare(bValue, 'th')
        : bValue.localeCompare(aValue, 'th')
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })
}

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array))
}

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{9,10}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Local Storage utilities
const CART_STORAGE_KEY = 'ecommerce-cart'
const PREFERENCES_STORAGE_KEY = 'ecommerce-preferences'

export const storage = {
  // Cart management
  getCart: (): LocalStorageCart => {
    if (typeof window === 'undefined') {
      return { items: [], updatedAt: new Date().toISOString() }
    }
    
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : { items: [], updatedAt: new Date().toISOString() }
    } catch {
      return { items: [], updatedAt: new Date().toISOString() }
    }
  },
  
  setCart: (cart: LocalStorageCart): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  },
  
  clearCart: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(CART_STORAGE_KEY)
  },
  
  // Preferences management
  getPreferences: (): Record<string, any> => {
    if (typeof window === 'undefined') return {}
    
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  },
  
  setPreferences: (preferences: Record<string, any>): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save preferences to localStorage:', error)
    }
  }
}

// Cart calculation utilities
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

export const calculateCartItemCount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export const findCartItem = (items: CartItem[], productId: string): CartItem | undefined => {
  return items.find(item => item.productId === productId)
}

export const addToCart = (items: CartItem[], product: Product, quantity: number = 1): CartItem[] => {
  const existingItem = findCartItem(items, product.id)
  
  if (existingItem) {
    return items.map(item =>
      item.productId === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    )
  }
  
  return [...items, {
    productId: product.id,
    quantity,
    price: product.price,
    product
  }]
}

export const removeFromCart = (items: CartItem[], productId: string): CartItem[] => {
  return items.filter(item => item.productId !== productId)
}

export const updateCartItemQuantity = (items: CartItem[], productId: string, quantity: number): CartItem[] => {
  if (quantity <= 0) {
    return removeFromCart(items, productId)
  }
  
  return items.map(item =>
    item.productId === productId
      ? { ...item, quantity }
      : item
  )
}

// Product utilities
export const getProductStockStatus = (stock: number): 'in-stock' | 'low-stock' | 'out-of-stock' => {
  if (stock === 0) return 'out-of-stock'
  if (stock < 10) return 'low-stock'
  return 'in-stock'
}

export const getProductStockLabel = (stock: number): string => {
  const status = getProductStockStatus(stock)
  
  switch (status) {
    case 'out-of-stock':
      return 'สินค้าหมด'
    case 'low-stock':
      return `เหลือ ${stock} ชิ้น`
    default:
      return `มีสินค้า ${stock} ชิ้น`
  }
}

export const calculateDiscountPrice = (originalPrice: number, discountPercent: number): number => {
  return originalPrice * (1 - discountPercent / 100)
}

export const calculateDiscountAmount = (originalPrice: number, discountPercent: number): number => {
  return originalPrice * (discountPercent / 100)
}

// Search and filter utilities
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

export const createSearchRegex = (searchTerm: string): RegExp => {
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(escapedTerm, 'i')
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Random utilities
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Error handling utilities
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await asyncFn()
  } catch (error) {
    console.error('Async operation failed:', error)
    return fallback
  }
}