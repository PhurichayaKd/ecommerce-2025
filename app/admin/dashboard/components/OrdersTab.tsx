"use client";

import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faEye,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faLock,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { orderApi } from "@/lib/api";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "รอดำเนินการ",
  success: "สำเร็จ",
  failed: "ล้มเหลว",
  completed: "สำเร็จ",
  shipped: "จัดส่งแล้ว",
  cancelled: "ยกเลิก",
};

interface OrdersTabProps {
  orders: any[];
  products: any[];
}

export default function OrdersTab({ orders, products }: OrdersTabProps) {
  const [orderFilter, setOrderFilter] = useState<
    "all" | "pending" | "success" | "failed" | "shipped" | "cancelled"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const ORDERS_PER_PAGE = 10;

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter((order) => order.status === orderFilter);
  }, [orders, orderFilter]);

  // Paginate orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  // Check if order is editable
  const isOrderEditable = (orderId: string): boolean => {
    return orderApi.isOrderEditable(orderId);
  };

  // Get order source info
  const getOrderSource = (orderId: string) => {
    return orderApi.getOrderSource(orderId);
  };

  // Handle order status update
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    // Check if order is editable
    if (!isOrderEditable(orderId)) {
      alert("ไม่สามารถแก้ไขออเดอร์นี้ได้ (ข้อมูลจำลอง - อ่านอย่างเดียว)");
      return;
    }

    if (
      !confirm(
        `คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะออเดอร์เป็น "${statusLabels[newStatus as keyof typeof statusLabels]}"?`
      )
    )
      return;

    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      alert("อัปเดตสถานะออเดอร์สำเร็จ!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการอัปเดตสถานะออเดอร์"
      );
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId: string) => {
    // Check if order is editable
    if (!isOrderEditable(orderId)) {
      alert("ไม่สามารถลบออเดอร์นี้ได้ (ข้อมูลจำลอง - อ่านอย่างเดียว)");
      return;
    }

    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบออเดอร์นี้?")) return;

    try {
      await orderApi.deleteOrder(orderId);
      alert("ลบออเดอร์สำเร็จ!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบออเดอร์"
      );
    }
  };

  // Handle view order details
  const handleViewOrderDetails = (order: any) => {
    setEditingOrder(order);
    setShowOrderModal(true);
  };

  return (
    <div>
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <FontAwesomeIcon
              icon={faClipboardList}
              className="text-blue-600 mt-1"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              ข้อมูลออเดอร์
            </h4>
            <p className="text-sm text-blue-700">
              • <strong>ออเดอร์ 1-79:</strong> ข้อมูลจำลอง (อ่านอย่างเดียว) -
              ไม่สามารถแก้ไขหรือลบได้
              <br />• <strong>ออเดอร์ 80+:</strong> ข้อมูลจริง -
              สามารถแก้ไขสถานะและลบได้
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
              รายการสั่งซื้อ
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faEdit} className="text-green-500" />
                <span>
                  แก้ไขได้: {orders.filter((o) => isOrderEditable(o.id)).length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                <span>
                  อ่านอย่างเดียว:{" "}
                  {orders.filter((o) => !isOrderEditable(o.id)).length}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={orderFilter}
              onChange={(e) => {
                setOrderFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">ทั้งหมด ({orders.length})</option>
              <option value="pending">
                รอดำเนินการ (
                {orders.filter((o) => o.status === "pending").length})
              </option>
              <option value="success">
                สำเร็จ ({orders.filter((o) => o.status === "success").length})
              </option>
              <option value="failed">
                ล้มเหลว ({orders.filter((o) => o.status === "failed").length})
              </option>
              <option value="shipped">
                จัดส่งแล้ว ({orders.filter((o) => o.status === "shipped").length})
              </option>
              <option value="cancelled">
                ยกเลิก ({orders.filter((o) => o.status === "cancelled").length})
              </option>
            </select>
            <div className="text-sm text-gray-500">
              แสดง {paginatedOrders.length} จาก {filteredOrders.length} รายการ
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รหัสคำสั่งซื้อ / แหล่งข้อมูล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ลูกค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนสินค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ยอดรวม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.id}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={isOrderEditable(order.id) ? faEdit : faLock}
                        className={
                          isOrderEditable(order.id)
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      />
                      {isOrderEditable(order.id)
                        ? "แก้ไขได้"
                        : "อ่านอย่างเดียว"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customerInfo.name}
                    </div>
                    <div className="text-sm text-gray-500">
                     {order.customerInfo.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items.length} รายการ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ฿{order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}
                    >
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="ดูรายละเอียด"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order.id, e.target.value)
                        }
                        disabled={!isOrderEditable(order.id)}
                        className={`text-xs px-2 py-1 border border-gray-300 rounded ${
                          !isOrderEditable(order.id)
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : ""
                        }`}
                        title={
                          isOrderEditable(order.id)
                            ? "เปลี่ยนสถานะ"
                            : "ไม่สามารถแก้ไขได้ (ข้อมูลจำลอง)"
                        }
                      >
                        <option value="pending">รอดำเนินการ</option>
                        <option value="success">สำเร็จ</option>
                        <option value="failed">ล้มเหลว</option>
                        <option value="shipped">จัดส่งแล้ว</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={!isOrderEditable(order.id)}
                        className={`${
                          isOrderEditable(order.id)
                            ? "text-red-600 hover:text-red-900"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        title={
                          isOrderEditable(order.id)
                            ? "ลบออเดอร์"
                            : "ไม่สามารถลบได้ (ข้อมูลจำลอง)"
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
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
                    {(currentPage - 1) * ORDERS_PER_PAGE + 1}
                  </span>{" "}
                  ถึง{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * ORDERS_PER_PAGE,
                      filteredOrders.length
                    )}
                  </span>{" "}
                  จาก{" "}
                  <span className="font-medium">{filteredOrders.length}</span>{" "}
                  รายการ
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === pageNum
                            ? "z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && editingOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    รายละเอียดออเดอร์ #{editingOrder.id}
                  </h3>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <FontAwesomeIcon
                      icon={isOrderEditable(editingOrder.id) ? faEdit : faLock}
                      className={
                        isOrderEditable(editingOrder.id)
                          ? "text-green-500"
                          : "text-gray-400"
                      }
                    />
                    {isOrderEditable(editingOrder.id)
                      ? "สามารถแก้ไขได้"
                      : "ข้อมูลจำลอง - อ่านอย่างเดียว"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setEditingOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      ข้อมูลออเดอร์
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          รหัสออเดอร์:
                        </span>
                        <span className="text-sm font-medium">
                          {editingOrder.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">สถานะ:</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${statusColors[editingOrder.status as keyof typeof statusColors]}`}
                        >
                          {
                            statusLabels[
                              editingOrder.status as keyof typeof statusLabels
                            ]
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ยอดรวม:</span>
                        <span className="text-sm font-medium text-green-600">
                          ฿{editingOrder.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          วันที่สั่งซื้อ:
                        </span>
                        <span className="text-sm">
                          {new Date(editingOrder.createAt).toLocaleDateString(
                            "th-TH",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      ข้อมูลลูกค้า
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ลูกค้า:</span>
                        <span className="text-sm font-medium">
                          ลูกค้า #{editingOrder.id.split("-")[1]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">อีเมล:</span>
                        <span className="text-sm">
                          customer{editingOrder.id.split("-")[1]}@email.com
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    รายการสินค้า
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md max-h-96 overflow-y-auto">
                    <div className="space-y-3">
                      {editingOrder.items.map((item: any, index: number) => {
                        const product = products.find(
                          (p) => p.id.toString() === item.productId.toString()
                        );
                        return (
                          <div
                            key={index}
                            className="flex items-center space-x-3 bg-white p-2 rounded"
                          >
                            <img
                              src={product?.image || "/placeholder-product.svg"}
                              alt={product?.name || `สินค้า #${item.productId}`}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder-product.svg";
                              }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {product?.name || `สินค้า #${item.productId}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                ราคา: ฿{item.price.toLocaleString()} ×{" "}
                                {item.qty} ชิ้น
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              ฿{(item.price * item.qty).toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">
                          ยอดรวมทั้งหมด:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ฿{editingOrder.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-between">
                <div className="flex space-x-2">
                  <select
                    value={editingOrder.status}
                    onChange={(e) => {
                      handleUpdateOrderStatus(editingOrder.id, e.target.value);
                      setShowOrderModal(false);
                      setEditingOrder(null);
                    }}
                    disabled={!isOrderEditable(editingOrder.id)}
                    className={`px-3 py-2 border border-gray-300 rounded-md text-sm ${
                      !isOrderEditable(editingOrder.id)
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <option value="pending">รอดำเนินการ</option>
                    <option value="success">สำเร็จ</option>
                    <option value="failed">ล้มเหลว</option>
                    <option value="shipped">จัดส่งแล้ว</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                  <button
                    onClick={() => {
                      handleDeleteOrder(editingOrder.id);
                      setShowOrderModal(false);
                      setEditingOrder(null);
                    }}
                    disabled={!isOrderEditable(editingOrder.id)}
                    className={`px-4 py-2 text-sm font-medium border border-transparent rounded-md ${
                      isOrderEditable(editingOrder.id)
                        ? "text-white bg-red-600 hover:bg-red-700"
                        : "text-gray-500 bg-gray-200 cursor-not-allowed"
                    }`}
                  >
                    {isOrderEditable(editingOrder.id)
                      ? "ลบออเดอร์"
                      : "ไม่สามารถลบได้"}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setEditingOrder(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
