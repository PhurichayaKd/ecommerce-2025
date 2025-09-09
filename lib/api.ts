import {
  Product,
  ProductSearchParams,
  PaginatedResponse,
  ApiResponse,
  DashboardStats,
} from "./types";

// Base API configuration
const MOCK_API_URL =
  "https://f0de5f29-9d77-419c-8be9-169ccb882360.mock.pstmn.io";
const REAL_API_URL = "http://54.169.154.143:3470";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||REAL_API_URL ;
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// Function to transform API response to expected format
function transformApiResponse(rawData: any): Product[] {
  // Handle the new API format: {"products": [...]}
  if (rawData && rawData.products && Array.isArray(rawData.products)) {
    return rawData.products.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || "",
      image: product.image || "/placeholder-product.svg",
      category: product.category || "Uncategorized",
      brand: product.brand || "",
      stock: product.stock || 0,
      currency: product.currency || "THB",
      imageAlt: product.imageAlt || product.name,
    }));
  }

  // Handle direct array format
  if (Array.isArray(rawData)) {
    return rawData.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || "",
      image: product.image || "/placeholder-product.svg",
      category: product.category || "Uncategorized",
      brand: product.brand || "",
      stock: product.stock || 0,
      currency: product.currency || "THB",
      imageAlt: product.imageAlt || product.name,
    }));
  }

  // Fallback for old nested format
  if (!rawData || typeof rawData !== "object") {
    return [];
  }

  // Extract products from the nested structure
  const products: Product[] = [];

  // Handle the case where data is in format { "0": product1, "1": product2, ... }
  Object.keys(rawData).forEach((key) => {
    if (key !== "id" && rawData[key] && typeof rawData[key] === "object") {
      const product = rawData[key];
      if (product.id && product.name && product.price) {
        products.push({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description || "",
          image: product.image || "/placeholder-product.svg",
          category: product.category || "Uncategorized",
          brand: product.brand || "Unknown",
          stock: product.stock || 0,
          currency: product.currency || "THB",
          imageAlt: product.imageAlt || product.name,
        });
      }
    }
  });

  return products;
}

// Generic API request function
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

// Dual API request function for combining mock and real data
async function dualApiRequest<T>(
  mockEndpoint: string,
  realEndpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Try to get data from both APIs
    const [mockResponse, realResponse] = await Promise.allSettled([
      fetch(`${MOCK_API_URL}${mockEndpoint}`, {
        headers: DEFAULT_HEADERS,
        ...options,
      }),
      fetch(`${REAL_API_URL}${realEndpoint}`, {
        headers: DEFAULT_HEADERS,
        ...options,
      }),
    ]);

    let mockData: any = null;
    let realData: any = null;

    // Process mock API response
    if (mockResponse.status === "fulfilled" && mockResponse.value.ok) {
      try {
        mockData = await mockResponse.value.json();
      } catch (e) {
        console.warn("Failed to parse mock API response:", e);
      }
    }

    // Process real API response
    if (realResponse.status === "fulfilled" && realResponse.value.ok) {
      try {
        realData = await realResponse.value.json();
      } catch (e) {
        console.warn("Failed to parse real API response:", e);
      }
    }

    // Combine the data
    const combinedData = {
      mock: mockData,
      real: realData,
    };

    return combinedData as T;
  } catch (error) {
    console.error("Dual API request failed:", error);
    throw error;
  }
}

// Product API functions
export const productApi = {
  // Get all products with optional filters and pagination
  getProducts: async (
    params: ProductSearchParams = {}
  ): Promise<PaginatedResponse<Product>> => {
    try {
      const queryString = buildQueryString(params);

      // Get data from both APIs
      const combinedData = await dualApiRequest<any>(
        `/ecomerce${queryString ? `?${queryString}` : ""}`,
        `/ecommerce-products${queryString ? `?${queryString}` : ""}`
      );

      let allProducts: Product[] = [];

      // Process mock API data (79 products)
      if (combinedData.mock) {
        const mockProducts = transformApiResponse(combinedData.mock);
        allProducts = [...allProducts, ...mockProducts];
      }

      // Process real API data and merge (avoid duplicates by ID)
      if (combinedData.real) {
        const realProducts = transformApiResponse(combinedData.real);
        realProducts.forEach((realProduct) => {
          // Only add if not already exists from mock data
          const exists = allProducts.some((p) => p.id === realProduct.id);
          if (!exists) {
            allProducts.push(realProduct);
          }
        });
      }

      // If no data from either API, fallback to mock only
      if (allProducts.length === 0) {
        try {
          const mockData = await apiRequest<any>(
            `/ecomerce${queryString ? `?${queryString}` : ""}`
          );
          allProducts = transformApiResponse(mockData);
        } catch (fallbackError) {
          console.error("Fallback API request failed:", fallbackError);
        }
      }

      const page = params.page || 1;
      const limit = params.limit || 20;
      const total = allProducts.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: allProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error loading products:", error);
      return {
        data: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Get single product by ID
  getProduct: async (id: number): Promise<ApiResponse<Product>> => {
    try {
      const rawData = await apiRequest<any>(`/ecommerce-products/${id}`);
      const products = transformApiResponse(rawData);

      if (products.length === 0) {
        throw new Error(`Product with ID ${id} not found`);
      }

      return {
        data: products[0],
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error loading product ${id}:`, error);
      throw new Error(`Product with ID ${id} not found`);
    }
  },

  // Search products
  searchProducts: async (
    query: string,
    filters: Partial<ProductSearchParams> = {}
  ): Promise<PaginatedResponse<Product>> => {
    return productApi.getProducts({ q: query, ...filters });
  },

  // Get products by category
  getProductsByCategory: async (
    category: string,
    params: Partial<ProductSearchParams> = {}
  ): Promise<PaginatedResponse<Product>> => {
    return productApi.getProducts({ category, ...params });
  },

  // Get featured products
  getFeaturedProducts: async (
    limit: number = 8
  ): Promise<ApiResponse<Product[]>> => {
    try {
      const rawData = await apiRequest<any>(
        `/ecommerce-products?featured=true&limit=${limit}`
      );
      const products = transformApiResponse(rawData);

      return {
        data: products.slice(0, limit),
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error loading featured products:", error);
      return {
        data: [],
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Get related products
  getRelatedProducts: async (
    productId: number,
    limit: number = 4
  ): Promise<ApiResponse<Product[]>> => {
    try {
      const rawData = await apiRequest<any>(
        `/ecommerce-products?related=${productId}&limit=${limit}`
      );
      const products = transformApiResponse(rawData);

      return {
        data: products.slice(0, limit),
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error loading related products:", error);
      return {
        data: [],
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Create new product (use Real API)
  createProduct: async (
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> => {
    try {
      const response = await fetch(`${REAL_API_URL}/ecommerce-products`, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Update product (try both APIs)
  updateProduct: async (
    id: number,
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> => {
    const results = {
      real: null as any,
      mock: null as any,
      errors: [] as string[],
    };

    // Try Real API first
    try {
      const realResponse = await fetch(
        `${REAL_API_URL}/ecommerce-products/${id}`,
        {
          method: "PUT",
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(productData),
        }
      );

      if (realResponse.ok) {
        results.real = await realResponse.json();
        console.log(`✅ Updated product ${id} in Real API`);
      } else {
        results.errors.push(`Real API: ${realResponse.status}`);
      }
    } catch (error) {
      results.errors.push(`Real API: ${error}`);
      console.warn(`⚠️ Failed to update product ${id} in Real API:`, error);
    }

    // Try Mock API (if it supports updates)
    try {
      const mockResponse = await fetch(`${MOCK_API_URL}/ecomerce/${id}`, {
        method: "PUT",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(productData),
      });

      if (mockResponse.ok) {
        results.mock = await mockResponse.json();
        console.log(`✅ Updated product ${id} in Mock API`);
      } else {
        results.errors.push(`Mock API: ${mockResponse.status}`);
      }
    } catch (error) {
      results.errors.push(`Mock API: ${error}`);
      console.warn(`⚠️ Failed to update product ${id} in Mock API:`, error);
    }

    // Return success if at least one API succeeded
    if (results.real || results.mock) {
      return {
        data: results.real || results.mock,
        success: true,
        timestamp: new Date().toISOString(),
        message: `Updated in ${results.real ? "Real" : ""}${results.real && results.mock ? " & " : ""}${results.mock ? "Mock" : ""} API`,
      };
    }

    // If both failed, throw error
    throw new Error(
      `Failed to update product ${id}: ${results.errors.join(", ")}`
    );
  },

  // Delete product (try both APIs)
  deleteProduct: async (id: number): Promise<ApiResponse<boolean>> => {
    const results = {
      real: false,
      mock: false,
      errors: [] as string[],
    };

    // Try Real API first
    try {
      const realResponse = await fetch(
        `${REAL_API_URL}/ecommerce-products/${id}`,
        {
          method: "DELETE",
          headers: DEFAULT_HEADERS,
        }
      );

      if (realResponse.ok) {
        results.real = true;
        console.log(`✅ Deleted product ${id} from Real API`);
      } else {
        results.errors.push(`Real API: ${realResponse.status}`);
      }
    } catch (error) {
      results.errors.push(`Real API: ${error}`);
      console.warn(`⚠️ Failed to delete product ${id} from Real API:`, error);
    }

    // Try Mock API (if it supports deletion)
    try {
      const mockResponse = await fetch(`${MOCK_API_URL}/ecomerce/${id}`, {
        method: "DELETE",
        headers: DEFAULT_HEADERS,
      });

      if (mockResponse.ok) {
        results.mock = true;
        console.log(`✅ Deleted product ${id} from Mock API`);
      } else {
        results.errors.push(`Mock API: ${mockResponse.status}`);
      }
    } catch (error) {
      results.errors.push(`Mock API: ${error}`);
      console.warn(`⚠️ Failed to delete product ${id} from Mock API:`, error);
    }

    // Return success if at least one API succeeded
    if (results.real || results.mock) {
      return {
        data: true,
        success: true,
        timestamp: new Date().toISOString(),
        message: `Deleted from ${results.real ? "Real" : ""}${results.real && results.mock ? " & " : ""}${results.mock ? "Mock" : ""} API`,
      };
    }

    // If both failed, throw error
    throw new Error(
      `Failed to delete product ${id}: ${results.errors.join(", ")}`
    );
  },

  // Get product by ID from both APIs
  getProductById: async (id: number): Promise<ApiResponse<Product>> => {
    const results = {
      real: null as any,
      mock: null as any,
      errors: [] as string[],
    };

    // Try Real API first
    try {
      const realResponse = await fetch(
        `${REAL_API_URL}/ecommerce-products/${id}`,
        {
          method: "GET",
          headers: DEFAULT_HEADERS,
        }
      );

      if (realResponse.ok) {
        const realData = await realResponse.json();
        results.real = transformApiResponse([realData])[0];
      } else {
        results.errors.push(`Real API: ${realResponse.status}`);
      }
    } catch (error) {
      results.errors.push(`Real API: ${error}`);
    }

    // Try Mock API
    try {
      const mockResponse = await fetch(`${MOCK_API_URL}/ecomerce`, {
        method: "GET",
        headers: DEFAULT_HEADERS,
      });

      if (mockResponse.ok) {
        const mockData = await mockResponse.json();
        const allProducts = transformApiResponse(mockData);
        results.mock = allProducts.find((p) => p.id === id);
      } else {
        results.errors.push(`Mock API: ${mockResponse.status}`);
      }
    } catch (error) {
      results.errors.push(`Mock API: ${error}`);
    }

    // Return the product from either API (prefer Real API)
    const product = results.real || results.mock;
    if (product) {
      return {
        data: product,
        success: true,
        timestamp: new Date().toISOString(),
        message: `Found in ${results.real ? "Real" : "Mock"} API`,
      };
    }

    throw new Error(
      `Product ${id} not found in either API: ${results.errors.join(", ")}`
    );
  },

  // Sync product between APIs (create in Real API if exists in Mock)
  syncProduct: async (id: number): Promise<ApiResponse<Product>> => {
    try {
      // Get product from Mock API
      const mockResponse = await fetch(`${MOCK_API_URL}/ecomerce`, {
        method: "GET",
        headers: DEFAULT_HEADERS,
      });

      if (!mockResponse.ok) {
        throw new Error("Failed to fetch from Mock API");
      }

      const mockData = await mockResponse.json();
      const allProducts = transformApiResponse(mockData);
      const product = allProducts.find((p) => p.id === id);

      if (!product) {
        throw new Error(`Product ${id} not found in Mock API`);
      }

      // Create in Real API
      const realResponse = await fetch(`${REAL_API_URL}/ecommerce-products`, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(product),
      });

      if (!realResponse.ok) {
        throw new Error(`Failed to create in Real API: ${realResponse.status}`);
      }

      const createdProduct = await realResponse.json();

      return {
        data: createdProduct,
        success: true,
        timestamp: new Date().toISOString(),
        message: `Synced product ${id} from Mock to Real API`,
      };
    } catch (error) {
      console.error(`Error syncing product ${id}:`, error);
      throw error;
    }
  },
};

// Dashboard API functions
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiRequest<ApiResponse<DashboardStats>>("/dashboard/stats");
  },

  // Get category statistics
  getCategoryStats: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<ApiResponse<any[]>>("/dashboard/categories");
  },
};

// Order API functions
export const orderApi = {
  // Get all orders (combine mock and real data)
  getOrders: async (): Promise<ApiResponse<any[]>> => {
    try {
      // Get data from both sources
      const [mockResponse, realResponse] = await Promise.allSettled([
        // Mock orders (read-only, IDs 1-79)
        import("../mock-order.json"),
        // Real API orders (editable, IDs 80+)
        fetch(`${REAL_API_URL}/ecommerce-orders`, {
          method: "GET",
          headers: DEFAULT_HEADERS,
        }),
      ]);

      let allOrders: any[] = [];

      // Process mock data
      if (mockResponse.status === "fulfilled" && mockResponse.value?.orders) {
        const mockOrders = mockResponse.value.orders;
        allOrders = [...allOrders, ...mockOrders];
        console.log(`✅ Loaded ${mockOrders.length} orders from Mock data`);
      }

      // Process real API data
      if (realResponse.status === "fulfilled" && realResponse.value.ok) {
        try {
          const realData = await realResponse.value.json();
          const realOrders = Array.isArray(realData) ? realData : [];

          // Only add orders that don't exist in mock data (avoid duplicates)
          realOrders.forEach((realOrder: any) => {
            const exists = allOrders.some((order) => order.id === realOrder.id);
            if (!exists) {
              allOrders.push(realOrder);
            }
          });
          console.log(`✅ Loaded ${realOrders.length} orders from Real API`);
        } catch (e) {
          console.warn("Failed to parse real API orders:", e);
        }
      }

      // Sort orders by creation date (newest first)
      allOrders.sort(
        (a, b) =>
          new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
      );

      return {
        data: allOrders,
        success: true,
        timestamp: new Date().toISOString(),
        message: `Loaded ${allOrders.length} orders total`,
      };
    } catch (error) {
      console.error("Error loading orders:", error);
      return {
        data: [],
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Get single order by ID (check both sources)
  getOrder: async (id: string): Promise<ApiResponse<any>> => {
    try {
      // Check if it's a mock order (ORD-00001 to ORD-00079)
      const orderNumber = parseInt(id.replace("ORD-", ""));

      if (orderNumber >= 1 && orderNumber <= 79) {
        // Get from mock data
        const mockData = await import("../mock-order.json");
        const order = mockData.orders.find((o: any) => o.id === id);

        if (order) {
          return {
            data: order,
            success: true,
            timestamp: new Date().toISOString(),
            message: "Found in Mock data (read-only)",
          };
        }
      }

      // Try real API for orders 80+ or if not found in mock
      const response = await fetch(`${REAL_API_URL}/ecommerce-orders/${id}`, {
        method: "GET",
        headers: DEFAULT_HEADERS,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          data,
          success: true,
          timestamp: new Date().toISOString(),
          message: "Found in Real API (editable)",
        };
      }

      throw new Error(`Order ${id} not found in either source`);
    } catch (error) {
      console.error(`Error loading order ${id}:`, error);
      throw new Error(`Order with ID ${id} not found`);
    }
  },

  // Update order (only works for Real API orders, IDs 80+)
  updateOrder: async (
    id: string,
    orderData: any
  ): Promise<ApiResponse<any>> => {
    const orderNumber = parseInt(id.replace("ORD-", ""));

    // Check if it's a mock order (read-only)
    if (orderNumber >= 1 && orderNumber <= 79) {
      throw new Error(
        `Order ${id} is read-only (Mock data). Only orders 80+ can be edited.`
      );
    }

    try {
      const response = await fetch(`${REAL_API_URL}/ecommerce-orders/${id}`, {
        method: "PUT",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
        message: `Updated order ${id} in Real API`,
      };
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },

  // Update order status (only works for Real API orders, IDs 80+)
  updateOrderStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse<any>> => {
    const orderNumber = parseInt(id.replace("ORD-", ""));

    // Check if it's a mock order (read-only)
    if (orderNumber >= 1 && orderNumber <= 79) {
      throw new Error(
        `Order ${id} is read-only (Mock data). Only orders 80+ can be edited.`
      );
    }

    try {
      const response = await fetch(`${REAL_API_URL}/ecommerce-orders/${id}`, {
        method: "PUT",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
        message: `Updated order ${id} status to ${status}`,
      };
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },

  // Delete order (only works for Real API orders, IDs 80+)
  deleteOrder: async (id: string): Promise<ApiResponse<boolean>> => {
    const orderNumber = parseInt(id.replace("ORD-", ""));

    // Check if it's a mock order (read-only)
    if (orderNumber >= 1 && orderNumber <= 79) {
      throw new Error(
        `Order ${id} is read-only (Mock data). Only orders 80+ can be deleted.`
      );
    }

    try {
      const response = await fetch(`${REAL_API_URL}/ecommerce-orders/${id}`, {
        method: "DELETE",
        headers: DEFAULT_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        data: true,
        success: true,
        timestamp: new Date().toISOString(),
        message: `Deleted order ${id} from Real API`,
      };
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  },

  // Create new order (always goes to Real API with ID 80+)
  createOrder: async (orderData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${REAL_API_URL}/ecommerce-orders`, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
        timestamp: new Date().toISOString(),
        message: "Created new order in Real API",
      };
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Check if order is editable (only Real API orders 80+)
  isOrderEditable: (id: string): boolean => {
    const orderNumber = parseInt(id.replace("ORD-", ""));
    return orderNumber >= 80;
  },

  // Get order source info
  getOrderSource: (
    id: string
  ): { source: "mock" | "real"; editable: boolean } => {
    const orderNumber = parseInt(id.replace("ORD-", ""));

    if (orderNumber >= 1 && orderNumber <= 79) {
      return { source: "mock", editable: false };
    } else {
      return { source: "real", editable: true };
    }
  },
};

// Export the API to use (use productApi only)
export const api = productApi;

// Export individual functions for convenience
export const getProducts = api.getProducts;
export const getProductById = api.getProduct;
export const searchProducts = api.searchProducts;
export const getProductsByCategory = api.getProductsByCategory;
export const createProduct = api.createProduct;
export const updateProduct = api.updateProduct;
export const deleteProduct = api.deleteProduct;
export const getDashboardStats = dashboardApi.getStats;
export const getOrders = orderApi.getOrders;
export const getOrder = orderApi.getOrder;
export const updateOrderStatus = orderApi.updateOrderStatus;
export const createOrder = orderApi.createOrder;

// Utility functions
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("An unknown error occurred");
};
