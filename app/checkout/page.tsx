"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { createOrder } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatTHB } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("ไม่มีสินค้าในตะกร้า");
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data in the format expected by the API
      const orderData = {
        id: Date.now(),
        createAt: new Date().toISOString(),
        items: items.map((item) => ({
          productId: parseInt(item.product.id.toString()),
          qty: item.quantity,
          price: item.product.price || 0,
        })),
        total: totalPrice,
        status: "pending",
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
        },
      };

      // Submit order to API
      const response = await createOrder(orderData);

      if (response.success) {
        // Clear cart
        clearCart();

        // Show success message
        alert("สั่งซื้อสำเร็จ! ขอบคุณสำหรับการสั่งซื้อ");

        // Redirect to home page
        router.push("/");
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ตะกร้าสินค้าว่าง
          </h1>
          <p className="text-gray-600 mb-6">
            กรุณาเพิ่มสินค้าในตะกร้าก่อนทำการสั่งซื้อ
          </p>
          <Button onClick={() => router.push("/")}>กลับไปเลือกสินค้า</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">ชำระเงิน</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            สรุปคำสั่งซื้อ
          </h2>

          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between items-center"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    จำนวน: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatTHB((item.product.price || 0) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>ยอดรวมทั้งสิ้น:</span>
              <span className="text-blue-600">{formatTHB(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Customer Information Form */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ข้อมูลลูกค้า
          </h2>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ-นามสกุล *
              </label>
              <Input
                type="text"
                required
                value={customerInfo.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล *
              </label>
              <Input
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="กรอกอีเมล"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์ *
              </label>
              <Input
                type="tel"
                required
                value={customerInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="กรอกเบอร์โทรศัพท์"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ที่อยู่จัดส่ง
              </label>
              <textarea
                value={customerInfo.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="กรอกที่อยู่จัดส่ง"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "กำลังดำเนินการ..." : "สั่งซื้อ"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
