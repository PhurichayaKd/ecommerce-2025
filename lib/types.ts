// Product related types
export interface Product {
  id: string | number
  name: string
  description: string
  price: number
  category: string
  stock: number
  image: string
  sku?: string
  brand?: string
  tags?: string[]
  rating?: number
  reviewCount?: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  createdAt?: string
  updatedAt?: string
  currency?: string
  imageAlt?: string
}

// Cart and Order related types
export interface CartItem {
  productId: string
  quantity: number
  price: number
  product?: Product
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  updatedAt: string
}

export interface OrderItem extends CartItem {
  subtotal: number
}

export interface Order {
  id: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  customerInfo: {
    name: string
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash_on_delivery'
  shippingMethod: 'standard' | 'express' | 'overnight'
  shippingCost: number
  tax: number
  discount?: number
  notes?: string
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  message?: string
  success: boolean
  timestamp: string
}

// Filter and Search types
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  brand?: string
  rating?: number
  tags?: string[]
}

export interface ProductSearchParams {
  q?: string // search query
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  brand?: string
  rating?: number
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt' | 'stock'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Dashboard and Analytics types
export interface DashboardStats {
  totalProducts: number
  totalValue: number
  lowStockCount: number
  averagePrice: number
  totalOrders: number
  totalRevenue: number
  topCategories: CategoryStats[]
  recentOrders: Order[]
}

export interface CategoryStats {
  category: string
  count: number
  value: number
  percentage: number
}

// UI Component types
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio'
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    message?: string
  }
}

// Error types
export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, any>
}

// Local Storage types
export interface LocalStorageCart {
  items: Array<{
    productId: string
    quantity: number
    addedAt: string
  }>
  updatedAt: string
}

// Theme and UI types
export type ThemeMode = 'light' | 'dark' | 'system'

export interface UIPreferences {
  theme: ThemeMode
  language: 'th' | 'en'
  currency: 'THB' | 'USD'
  itemsPerPage: number
}

// Utility types
export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Event types
export interface ProductEvent {
  type: 'view' | 'add_to_cart' | 'remove_from_cart' | 'purchase'
  productId: string
  quantity?: number
  timestamp: string
  sessionId?: string
}

// Export commonly used type combinations
export type ProductWithCart = Product & {
  cartQuantity?: number
  inCart?: boolean
}

export type ProductListItem = Pick<Product, 'id' | 'name' | 'price' | 'image' | 'stock' | 'category' | 'rating'>

export type ProductSummary = Pick<Product, 'id' | 'name' | 'price' | 'stock' | 'category'>