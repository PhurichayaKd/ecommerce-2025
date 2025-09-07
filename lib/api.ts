import { Product, ProductSearchParams, PaginatedResponse, ApiResponse, DashboardStats } from './types'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://54.169.154.143:3470'
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: DEFAULT_HEADERS,
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Product API functions
export const productApi = {
  // Get all products with optional filters and pagination
  getProducts: async (params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> => {
    const searchParams = new URLSearchParams()
    
    // Filter out React Query specific parameters
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key]) => 
        !['client', 'queryKey', 'signal', 'meta'].includes(key)
      )
    )
    
    Object.entries(filteredParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/ecommerce-products${queryString ? `?${queryString}` : ''}`
    
    const response = await apiRequest<any>(endpoint)
    
    // Transform the response to match our expected structure
    // API Sandbox returns complex nested structure, extract products
    let productsArray: Product[] = []
    
    if (Array.isArray(response)) {
      // Handle array response
      productsArray = response.flatMap(item => {
        if (item && typeof item === 'object') {
          // Extract products from nested structure
          const products = Object.values(item).filter(value => 
            value && typeof value === 'object' && 'id' in value && 'name' in value
          )
          return products as Product[]
        }
        return []
      })
    } else if (response && typeof response === 'object') {
      // Handle object response
      productsArray = Object.values(response).filter(value => 
        value && typeof value === 'object' && 'id' in value && 'name' in value
      ) as Product[]
    }
    
    return {
      data: productsArray || [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: productsArray?.length || 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      },
      success: true,
      timestamp: new Date().toISOString()
    }
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await apiRequest<{products: Product[]}>('/ecomerce')
    const product = response.products?.find(p => p.id.toString() === id)
    
    if (!product) {
      throw new Error(`Product with ID ${id} not found`)
    }
    
    return {
      data: product,
      success: true,
      timestamp: new Date().toISOString()
    }
  },

  // Search products
  searchProducts: async (query: string, filters: Partial<ProductSearchParams> = {}): Promise<PaginatedResponse<Product>> => {
    return productApi.getProducts({ q: query, ...filters })
  },

  // Get products by category
  getProductsByCategory: async (category: string, params: Partial<ProductSearchParams> = {}): Promise<PaginatedResponse<Product>> => {
    return productApi.getProducts({ category, ...params })
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 8): Promise<ApiResponse<Product[]>> => {
    const response = await apiRequest<{products: Product[]}>('/ecomerce')
    const featuredProducts = response.products?.slice(0, limit) || []
    
    return {
      data: featuredProducts,
      success: true,
      timestamp: new Date().toISOString()
    }
  },

  // Get related products
  getRelatedProducts: async (productId: string, limit: number = 4): Promise<ApiResponse<Product[]>> => {
    const response = await apiRequest<{products: Product[]}>('/ecomerce')
    const allProducts = response.products || []
    const relatedProducts = allProducts
      .filter(p => p.id.toString() !== productId)
      .slice(0, limit)
    
    return {
      data: relatedProducts,
      success: true,
      timestamp: new Date().toISOString()
    }
  }
}

// Dashboard API functions
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiRequest<ApiResponse<DashboardStats>>('/dashboard/stats')
  },

  // Get category statistics
  getCategoryStats: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<ApiResponse<any[]>>('/dashboard/categories')
  }
}




// Export the API to use (use productApi only)
export const api = productApi

// Export individual functions for convenience
export const getProducts = api.getProducts
export const getProductById = api.getProduct
export const searchProducts = api.searchProducts
export const getProductsByCategory = api.getProductsByCategory
export const getDashboardStats = dashboardApi.getStats

// Utility functions
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error
  }
  
  if (error instanceof Error) {
    return new ApiError(error.message)
  }
  
  return new ApiError('An unknown error occurred')
}