'use client'

import { useCart } from '@/components/providers/CartProvider'
import CartItem from '@/components/cart/CartItem'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatTHB } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">ตะกร้าสินค้า</h1>
          </div>
          
          <Card className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">ตะกร้าสินค้าว่างเปล่า</h2>
            <p className="text-gray-500 mb-6">เพิ่มสินค้าลงในตะกร้าเพื่อเริ่มต้นการสั่งซื้อ</p>
            <Link href="/">
              <Button variant="primary">
                เลือกซื้อสินค้า
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">ตะกร้าสินค้า</h1>
          <span className="text-sm text-gray-500">({totalItems} รายการ)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <Button
                onClick={clearCart}
                variant="secondary"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                ล้างตะกร้าทั้งหมด
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">สรุปคำสั่งซื้อ</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">จำนวนสินค้า</span>
                  <span>{totalItems} ชิ้น</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ราคารวม</span>
                  <span>{formatTHB(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ค่าจัดส่ง</span>
                  <span className="text-green-600">ฟรี</span>
                </div>
                
                <hr className="my-3" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>ยอดรวมทั้งสิ้น</span>
                  <span className="text-primary-600">{formatTHB(totalPrice)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  ดำเนินการสั่งซื้อ
                </Button>
                
                <Link href="/" className="block">
                  <Button variant="secondary" className="w-full">
                    เลือกซื้อสินค้าเพิ่ม
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}