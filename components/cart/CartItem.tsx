'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CartItem as CartItemType, useCart } from '@/components/providers/CartProvider'
import { formatTHB } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const { product } = item

  const handleQuantityChange = (newQuantity: string) => {
    setQuantity(newQuantity)
    const numQuantity = parseInt(newQuantity)
    if (!isNaN(numQuantity) && numQuantity >= 0) {
      updateQuantity(product.id, numQuantity)
    }
  }

  const handleRemove = () => {
    removeItem(product.id)
  }

  const totalPrice = (product.price || 0) * item.quantity

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.image || '/placeholder-image.jpg'}
            alt={product.name || 'Product'}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-image.jpg'
            }}
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {product.name || 'ไม่มีชื่อสินค้า'}
        </h3>
        
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {product.description || 'ไม่มีรายละเอียด'}
        </p>
        
        <div className="flex items-center gap-4 mt-3">
          <div className="text-lg font-bold text-blue-600">
            {formatTHB(product.price || 0)}
          </div>
          
          {product.stock !== undefined && (
            <div className="text-sm text-gray-500">
              คงเหลือ: {product.stock} ชิ้น
            </div>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange((item.quantity - 1).toString())}
          disabled={item.quantity <= 1}
          className="w-8 h-8 p-0"
        >
          -
        </Button>
        
        <Input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          className="w-16 text-center"
          min="1"
          max={product.stock}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange((item.quantity + 1).toString())}
          disabled={product.stock !== undefined && item.quantity >= product.stock}
          className="w-8 h-8 p-0"
        >
          +
        </Button>
      </div>

      {/* Total Price */}
      <div className="text-right min-w-0">
        <div className="text-lg font-bold text-gray-900">
          {formatTHB(totalPrice)}
        </div>
        <div className="text-sm text-gray-500">
          {item.quantity} ชิ้น
        </div>
      </div>

      {/* Remove Button */}
      <div className="flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          ลบ
        </Button>
      </div>
    </div>
  )
}