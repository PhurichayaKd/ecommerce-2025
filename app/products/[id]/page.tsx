'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { getProducts } from '@/lib/api'
import { formatTHB, isLowStock } from '@/lib/utils'
import { useCart } from '@/components/providers/CartProvider'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

// Helper function to get valid image source
function getValidImageSrc(imageSrc: string | undefined): string {
  if (!imageSrc) return '/placeholder-product.svg'
  
  // Check if it's a relative path starting with /images/ (which doesn't exist)
  if (imageSrc.startsWith('/images/')) {
    return '/placeholder-product.svg'
  }
  
  // Check if it's a valid URL
  try {
    new URL(imageSrc)
    return imageSrc
  } catch {
    return '/placeholder-product.svg'
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const [quantity, setQuantity] = useState(1)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const { addItem } = useCart()

  const { data: productsResponse, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const products = productsResponse?.data || []
  const product = products.find(p => p.id.toString() === productId)

  const handleAddToCart = () => {
    if (!product) return
    
    // Add to cart using Cart Context
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
    
    setIsAddedToCart(true)
    
    // Reset after 2 seconds
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <EmptyState 
          title="ไม่พบสินค้า"
          description="สินค้าที่คุณค้นหาไม่มีอยู่ในระบบ"
        />
      </div>
    )
  }

  const isOutOfStock = product.stock === 0
  const isLowStockItem = isLowStock(product.stock)

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <a href="/" className="hover:text-primary-600">หน้าแรก</a>
        <span className="mx-2">/</span>
        <a href="/products" className="hover:text-primary-600">สินค้าทั้งหมด</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <Card className="overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={getValidImageSrc(product.image)}
                alt={product.name || 'Product image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.svg';
                }}
              />
            </div>
          </Card>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{product.category}</Badge>
              {isOutOfStock && (
                <Badge variant="error">สินค้าหมด</Badge>
              )}
              {!isOutOfStock && isLowStockItem && (
                <Badge variant="warning">เหลือน้อย</Badge>
              )}
            </div>
            <div className="text-3xl font-bold text-primary-600">
              {formatTHB(product.price)}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              รายละเอียดสินค้า
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                จำนวนคงเหลือ:
              </span>
              <span className={`text-sm font-semibold ${
                isOutOfStock ? 'text-error-500' : 
                isLowStockItem ? 'text-warning-500' : 'text-success-500'
              }`}>
                {product.stock} ชิ้น
              </span>
            </div>

            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  จำนวน:
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-center min-w-[60px]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full"
                size="lg"
              >
                {isAddedToCart ? '✓ เพิ่มลงตะกร้าแล้ว' : 
                 isOutOfStock ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
              </Button>
              
              {!isOutOfStock && (
                <div className="text-sm text-gray-600 text-center">
                  รวม: {formatTHB(product.price * quantity)}
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <Card className="p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-2">
              ข้อมูลเพิ่มเติม
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>รหัสสินค้า: #{product.id}</div>
              <div>หมวดหมู่: {product.category}</div>
              <div>สถานะ: {isOutOfStock ? 'สินค้าหมด' : 'พร้อมจำหน่าย'}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}