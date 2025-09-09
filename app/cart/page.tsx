"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import CartItem from "@/components/cart/CartItem";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { formatTHB } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faCreditCard,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";

export default function CartPage() {
  const router = useRouter();
  const { items, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-8">
        <EmptyState
          title="ตะกร้าสินค้าว่าง"
          description="คุณยังไม่ได้เพิ่มสินค้าใดในตะกร้า"
        />
        <div className="text-center mt-6">
          <Button onClick={() => router.push("/")}>เลือกซื้อสินค้า</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ตะกร้าสินค้า</h1>
        <p className="text-gray-600">คุณมีสินค้า {totalItems} รายการในตะกร้า</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              สรุปคำสั่งซื้อ
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">จำนวนสินค้า:</span>
                <span className="font-medium">{totalItems} รายการ</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ยอดรวม:</span>
                <span className="font-medium">{formatTHB(totalPrice)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ค่าจัดส่ง:</span>
                <span className="font-medium text-green-600">ฟรี</span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>ยอดรวมทั้งสิ้น:</span>
                <span className="text-blue-600">{formatTHB(totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/checkout")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                ดำเนินการสั่งซื้อ
              </Button>

              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                เลือกซื้อสินค้าเพิ่ม
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
