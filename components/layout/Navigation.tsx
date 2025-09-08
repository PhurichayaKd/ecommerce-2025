'use client'

import Link from 'next/link'
import { useCart } from '@/components/providers/CartProvider'
import { ShoppingCart } from 'lucide-react'

export default function Navigation() {
  const { totalItems } = useCart()

  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Link 
        href="/" 
        className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
      >
        หน้าแรก
      </Link>
      <Link 
        href="/products" 
        className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
      >
        สินค้า
      </Link>
      <Link 
        href="/cart" 
        className="relative text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2"
      >
        <ShoppingCart className="w-5 h-5" />
        <span>ตะกร้า</span>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </Link>
    </nav>
  )
}