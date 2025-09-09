import { Product, ProductSearchParams, PaginatedResponse, ApiResponse, DashboardStats } from './types'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://54.165.154.143:3470'
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

// Function to transform API response to expected format
function transformApiResponse(rawData: any): Product[] {
  // Handle the new API format: {"products": [...]}
  if (rawData && rawData.products && Array.isArray(rawData.products)) {
    return rawData.products.map((product: any) => ({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      description: product.description || '',
      image: product.image || '/placeholder-product.svg',
      category: product.category || 'Uncategorized',
      brand: product.brand || '',
      stock: product.stock || 0,
      currency: product.currency || 'THB',
      imageAlt: product.imageAlt || product.name
    }))
  }
  
  // Fallback for old format
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return []
  }
  
  const firstItem = rawData[0]
  if (!firstItem || typeof firstItem !== 'object') {
    return []
  }
  
  // Extract products from the nested structure
  const products: Product[] = []
  
  // Handle the case where data is in format [{ "0": product1, "1": product2, ... }]
  Object.keys(firstItem).forEach(key => {
    if (key !== 'id' && firstItem[key] && typeof firstItem[key] === 'object') {
      const product = firstItem[key]
      if (product.id && product.name && product.price) {
        // Use local placeholder image since API images don't exist
        const placeholderImage = '/placeholder-product.svg'
        
        products.push({
          id: product.id.toString(),
          name: product.name,
          price: product.price,
          description: product.description || '',
          image: placeholderImage,
          category: product.category || 'Uncategorized',
          brand: product.brand || '',
          stock: product.stock || 0,
          currency: product.currency || 'USD',
          imageAlt: product.imageAlt || product.name
        })
      }
    }
  })
  
  return products
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}


// Product API functions
export const productApi = {
  // Get all products with optional filters and pagination
  getProducts: async (params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> => {
    try {
      const queryString = buildQueryString(params)
      const endpoint = `/ecommerce-products${queryString ? `?${queryString}` : ''}`
      const rawData = await apiRequest<any>(endpoint)
      const products = transformApiResponse(rawData)
      
      const page = params.page || 1
      const limit = params.limit || 20
      const total = products.length
      const totalPages = Math.ceil(total / limit)
      
      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error loading products:', error)
      return {
        data: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        success: false,
        timestamp: new Date().toISOString()
      }
    }
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    try {
      const rawData = await apiRequest<any>(`/ecommerce-products/${id}`)
      const products = transformApiResponse(rawData)
      
      if (products.length === 0) {
        throw new Error(`Product with ID ${id} not found`)
      }
      
      return {
        data: products[0],
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Error loading product ${id}:`, error)
      throw new Error(`Product with ID ${id} not found`)
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
    try {
      const rawData = await apiRequest<any>(`/ecommerce-products?featured=true&limit=${limit}`)
      const products = transformApiResponse(rawData)
      
      return {
        data: products.slice(0, limit),
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error loading featured products:', error)
      return {
        data: [],
        success: false,
        timestamp: new Date().toISOString()
      }
    }
  },

  // Get related products
  getRelatedProducts: async (productId: string, limit: number = 4): Promise<ApiResponse<Product[]>> => {
    try {
      const rawData = await apiRequest<any>(`/ecomerce?related=${productId}&limit=${limit}`)
      const products = transformApiResponse(rawData)
      
      return {
        data: products.slice(0, limit),
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error loading related products:', error)
      return {
        data: [],
        success: false,
        timestamp: new Date().toISOString()
      }
    }
  },

  // Create new product
  createProduct: async (productData: Partial<Product>): Promise<ApiResponse<Product>> => {
    try {
      const data = await apiRequest<any>('/ecomerce', {
        method: 'POST',
        body: JSON.stringify(productData)
      })
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  // Update product
  updateProduct: async (id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> => {
    try {
      const data = await apiRequest<any>(`/ecomerce/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      })
      
      return {
        data,
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  // Delete product
  deleteProduct: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      await apiRequest<any>(`/ecomerce/${id}`, {
        method: 'DELETE'
      })
      
      return {
        data: true,
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
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

// Order API functions
export const orderApi = {
  // Get all orders
  getOrders: async (): Promise<ApiResponse<any[]>> => {
    try {
      const data = await apiRequest<any>('/orders')
      return {
        data: data || [],
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      return {
        data: [],
        success: false,
        timestamp: new Date().toISOString()
      }
    }
  },

  // Get single order by ID
  getOrder: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const data = await apiRequest<any>(`/orders/${id}`)
      return {
        data,
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Error loading order ${id}:`, error)
      throw new Error(`Order with ID ${id} not found`)
    }
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string): Promise<ApiResponse<any>> => {
    try {
      const data = await apiRequest<any>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      return {
        data,
        success: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Error updating order ${id}:`, error)
      throw error
    }
  }
}




// Export the API to use (use productApi only)
export const api = productApi

// Export individual functions for convenience
export const getProducts = api.getProducts
export const getProductById = api.getProduct
export const searchProducts = api.searchProducts
export const getProductsByCategory = api.getProductsByCategory
export const createProduct = api.createProduct
export const updateProduct = api.updateProduct
export const deleteProduct = api.deleteProduct
export const getDashboardStats = dashboardApi.getStats
export const getOrders = orderApi.getOrders
export const getOrder = orderApi.getOrder
export const updateOrderStatus = orderApi.updateOrderStatus

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