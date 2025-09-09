"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getOrders } from "@/lib/api";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import mockOrderData from "@/mock-order.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faRefresh,
  faArrowLeft,
  faBox,
  faRectangleList,
} from "@fortawesome/free-solid-svg-icons";

// Import Tab Components
import OverviewTab from "./components/OverviewTab";
import OrdersTab from "./components/OrdersTab";
import ProductsTab from "./components/ProductsTab";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "products"
  >("overview");

  const {
    data: productsResponse,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({}),
    retry: 2,
    retryDelay: 1000,
  });

  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  const products = productsResponse?.data || [];
  // Use mock data for orders with fallback to API data
  const orders = mockOrderData.orders || ordersResponse?.data || [];

  // Debug information
  console.log(" Dashboard Data:", {
    productsCount: products.length,
    ordersCount: orders.length,
    productsLoading,
    productsError: productsError?.message,
    productsSuccess: productsResponse?.success,
  });

  if (productsLoading || ordersLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <FontAwesomeIcon icon={faChartLine} className="mr-3" />
            Dashboard Admin
          </h1>
          <p className="text-gray-600">จัดการและติดตามข้อมูลร้านค้า</p>
          <div className="mt-2 flex gap-4 text-sm">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                products.length > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <FontAwesomeIcon icon={faBox} className="mr-2" /> สินค้า: {products.length} รายการ
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                orders.length > 0
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <FontAwesomeIcon icon={faRectangleList} className="mr-2" /> ออเดอร์: {orders.length} รายการ
            </span>
            {productsError && (
              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                ⚠️ API Error
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <FontAwesomeIcon icon={faRefresh} className="mr-2" />
            รีเฟรช
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            กลับหน้าหลัก
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "orders"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            รายการสั่งซื้อ
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "products"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            จัดการสินค้า
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab
          products={products}
          orders={orders}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === "orders" && (
        <OrdersTab orders={orders} products={products} />
      )}

      {activeTab === "products" && <ProductsTab products={products} />}
    </div>
  );
}
