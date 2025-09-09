"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faPlus,
  faEdit,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faRectangleList,
} from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/ui/Button";
import { brands } from "@fortawesome/fontawesome-svg-core/import.macro";
import { faTable } from "@fortawesome/free-solid-svg-icons/faTable";
import { faSync } from "@fortawesome/free-solid-svg-icons/faSync";

interface ProductsTabProps {
  products: any[];
}

export default function ProductsTab({ products }: ProductsTabProps) {
  const [productPage, setProductPage] = useState(1);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    brand: "",
    image: "/placeholder-product.svg",
  });
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const PRODUCTS_PER_PAGE = 20;

  // Product filtering and pagination
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(productSearch.toLowerCase());
      const matchesCategory =
        productCategoryFilter === "all" ||
        product.category === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (productPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, productPage]);

  const productTotalPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE
  );

  // Get unique categories for filter
  const productCategories = useMemo(() => {
    const categorySet = new Set(
      products.map((p: any) => p.category).filter(Boolean)
    );
    const categories = Array.from(categorySet);
    return categories.sort();
  }, [products]);

  // Reset form
  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      brand: "",
      image: "/placeholder-product.svg",
    });
    setEditingProduct(null);
  };

  // Handle product form submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!productForm.name.trim()) {
      alert("กรุณาใส่ชื่อสินค้า");
      return;
    }
    if (!productForm.category.trim()) {
      alert("กรุณาใส่หมวดหมู่สินค้า");
      return;
    }
    if (parseFloat(productForm.price) <= 0) {
      alert("กรุณาใส่ราคาที่ถูกต้อง");
      return;
    }
    if (parseInt(productForm.stock) < 0) {
      alert("กรุณาใส่จำนวนสต็อกที่ถูกต้อง");
      return;
    }

    const productData = {
      id: Math.floor(Math.random() * 79) + 1,
      name: productForm.name,
      description: productForm.description,
      category: productForm.category,
      brand: productForm.brand,
      price: parseFloat(productForm.price) || 0,
      stock: parseInt(productForm.stock) || 0,
      currency: "THB",
      imageAlt: productForm.name,
      image: productForm.image || "/placeholder-product.svg",
    };

    try {
      // Import API functions
      const { createProduct, updateProduct } = await import("@/lib/api");

      let result;
      if (editingProduct) {
        // Update existing product (tries both APIs)
        result = await updateProduct(editingProduct.id, productData);
        alert(`อัปเดตสินค้าสำเร็จ!\n${result.message || ""}`);
      } else {
        // Add new product (creates in Real API)
        result = await createProduct(productData);
        alert(`เพิ่มสินค้าสำเร็จ!\n${result.message || ""}`);
      }

      if (result.success) {
        setShowProductModal(false);
        resetProductForm();
        window.location.reload();
      } else {
        throw new Error("Operation failed");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(
        `เกิดข้อผิดพลาดในการ${editingProduct ? "อัปเดต" : "เพิ่ม"}สินค้า:\n${error}`
      );
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: number) => {
    const id = productId;

    // Check if it's a Mock API product (read-only)
    if (id <= 79) {
      alert(
        "ไม่สามารถลบสินค้าจาก Mock API ได้\n\nสินค้า ID 1-79 เป็นข้อมูลตัวอย่างที่อ่านอย่างเดียว"
      );
      return;
    }

    if (
      !confirm(
        `คุณแน่ใจหรือไม่ที่จะลบสินค้า ID: ${productId}?\n\nจะลบจาก Real API เท่านั้น`
      )
    )
      return;

    try {
      // Import deleteProduct function
      const { deleteProduct } = await import("@/lib/api");

      const result = await deleteProduct(productId);

      if (result.success) {
        alert(`ลบสินค้าสำเร็จ!\n${result.message || ""}`);
        window.location.reload();
      } else {
        throw new Error("Delete operation failed");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(`เกิดข้อผิดพลาดในการลบสินค้า:\n${error}`);
    }
  };

  // Handle edit product
  const handleEditProduct = (product: any) => {
    const id = parseInt(product.id);

    // Check if it's a Mock API product (read-only)
    if (id <= 79) {
      alert(
        "ไม่สามารถแก้ไขสินค้าจาก Mock API ได้\n\nสินค้า ID 1-79 เป็นข้อมูลตัวอย่างที่อ่านอย่างเดียว\nใช้ปุ่ม 'Sync' เพื่อคัดลอกไป Real API แทน"
      );
      return;
    }

    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      stock: product.stock?.toString() || "",
      brand: product.brand || "",
      image: product.image || "/placeholder-product.svg",
    });
    setShowProductModal(true);
  };
  return (
    <div>
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            <FontAwesomeIcon icon={faBox} className="mr-2" />
            จัดการสินค้า
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  resetProductForm();
                  setShowProductModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
                title="เพิ่มสินค้าใหม่ใน Real API"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                เพิ่มสินค้าใหม่
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              <div>
                แสดง {paginatedProducts.length} จาก {filteredProducts.length}{" "}
                รายการ
              </div>
              <div className="flex gap-3 mt-1">
                <span className="text-blue-600">
                  <FontAwesomeIcon icon={faRectangleList} className="mr-2" />
                  Mock: {products.filter((p) => parseInt(p.id) <= 79).length}
                </span>
                <span className="text-green-600">
                  <FontAwesomeIcon icon={faTable} className="mr-2" />
                  Real: {products.filter((p) => parseInt(p.id) > 79).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Search and Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setProductPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <select
              value={productCategoryFilter}
              onChange={(e) => {
                setProductCategoryFilter(e.target.value);
                setProductPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">หมวดหมู่ทั้งหมด</option>
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สินค้า & แหล่งข้อมูล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หมวดหมู่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ราคา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สต็อก
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={product.image}
                          alt={product.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-product.svg";
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          {/* Source indicator */}
                          {parseInt(product.id) <= 79 ? (
                            <span
                              className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                              title="Mock API - อ่านอย่างเดียว"
                            >
                              <FontAwesomeIcon
                                icon={faRectangleList}
                                className="mr-2"
                              />
                              Mock
                            </span>
                          ) : (
                            <span
                              className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800"
                              title="Real API - แก้ไข/ลบได้"
                            >
                              <FontAwesomeIcon
                                icon={faTable}
                                className="mr-2"
                              />
                              Real
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          ID: {product.id} • {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ฿{(product.price || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (product.stock || 0) < 10
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.stock || 0} ชิ้น
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      {parseInt(product.id) <= 79 ? (
                        // Mock API products (ID 1-79) - Read-only
                        <>
                          {/* <button
                            onClick={() => handleSyncProduct(product.id)}
                            className="text-green-600 hover:text-green-900 px-2 py-1 text-xs"
                            title="ซิงค์จาก Mock API ไป Real API"
                          >
                            <FontAwesomeIcon icon={faSync} className="mr-2" />{" "}
                            Sync
                          </button> */}
                          <span
                            className="text-gray-400 px-2 py-1 text-xs"
                            title="สินค้าจาก Mock API - ไม่สามารถแก้ไขหรือลบได้"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            อ่านอย่างเดียว
                          </span>
                        </>
                      ) : (
                        // Real API products (ID 80+) - Full CRUD
                        <>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs"
                            title="แก้ไขสินค้า (Real API)"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 text-xs"
                            title="ลบสินค้า (Real API)"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            ลบ
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product Pagination */}
        {productTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setProductPage(Math.max(1, productPage - 1))}
                disabled={productPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() =>
                  setProductPage(Math.min(productTotalPages, productPage + 1))
                }
                disabled={productPage === productTotalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  แสดง{" "}
                  <span className="font-medium">
                    {(productPage - 1) * PRODUCTS_PER_PAGE + 1}
                  </span>{" "}
                  ถึง{" "}
                  <span className="font-medium">
                    {Math.min(
                      productPage * PRODUCTS_PER_PAGE,
                      filteredProducts.length
                    )}
                  </span>{" "}
                  จาก{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  รายการ
                  {productSearch && ` (กรองจาก ${products.length} รายการ)`}
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setProductPage(Math.max(1, productPage - 1))}
                    disabled={productPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  {Array.from(
                    { length: Math.min(5, productTotalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setProductPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            productPage === pageNum
                              ? "z-10 bg-blue-600 text-white"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() =>
                      setProductPage(
                        Math.min(productTotalPages, productPage + 1)
                      )
                    }
                    disabled={productPage === productTotalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
              </h3>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ชื่อสินค้า
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ราคา (บาท)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      จำนวนสต็อก
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    หมวดหมู่
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">หมวดหมู่ทั้งหมด</option>
                    {productCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    แบรนด์
                  </label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) =>
                      setProductForm({ ...productForm, brand: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    URL รูปภาพ
                  </label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) =>
                      setProductForm({ ...productForm, image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    ใส่ URL รูปภาพสินค้า หรือเว้นว่างเพื่อใช้รูปเริ่มต้น
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      resetProductForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {editingProduct ? "อัปเดต" : "เพิ่มสินค้า"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
