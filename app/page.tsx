"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple, faDashboard } from "@fortawesome/free-solid-svg-icons";

const ITEMS_PER_PAGE = 12;

type SortOption = "name" | "price-asc" | "price-desc" | "stock";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({}),
  });

  // Ensure products is always an array
  const products = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
  }, [response]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];
    const categorySet = new Set(
      products.map((p) => p.category).filter(Boolean)
    );
    const uniqueCategories = Array.from(categorySet);
    return uniqueCategories.sort();
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product: Product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "stock":
          return (b.stock || 0) - (a.stock || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredAndSortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = useMemo(() => {
    return () => setCurrentPage(1);
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <EmptyState
          title="เกิดข้อผิดพลาด"
          description="ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง"
        />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            สินค้าทั้งหมด
          </h1>
          <p className="text-gray-600">ค้นหาและเรียกดูสินค้าทั้งหมดในร้าน</p>
        </div>
        <Button
          onClick={() => (window.location.href = "/admin/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
        <FontAwesomeIcon icon={faChartSimple} className="mr-2" /> Dashboard Admin
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="ค้นหาสินค้า..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <Select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">หมวดหมู่ทั้งหมด</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="name">เรียงตามชื่อ</option>
          <option value="price-asc">ราคา: ต่ำ → สูง</option>
          <option value="price-desc">ราคา: สูง → ต่ำ</option>
          <option value="stock">จำนวนคงเหลือ</option>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory("all");
            setSortBy("name");
            setCurrentPage(1);
          }}
        >
          ล้างตัวกรอง
        </Button>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        พบ {filteredAndSortedProducts.length} รายการ
        {searchTerm && ` สำหรับ "${searchTerm}"`}
        {selectedCategory !== "all" && ` ในหมวดหมู่ "${selectedCategory}"`}
      </div>

      {/* Products Grid */}
      {paginatedProducts.length === 0 ? (
        <EmptyState
          title="ไม่พบสินค้า"
          description="ลองเปลี่ยนคำค้นหาหรือตัวกรองเพื่อดูสินค้าอื่น"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
