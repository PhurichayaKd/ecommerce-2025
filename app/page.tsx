'use client'

import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/lib/api'
import { formatTHB } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

export default function Dashboard() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  // Ensure products is always an array
  const products = Array.isArray(response?.data) ? response.data : 
                   Array.isArray(response) ? response : []

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <EmptyState 
          title="เกิดข้อผิดพลาด"
          description="ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง"
        />
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="container py-8">
        <EmptyState 
          title="ไม่มีข้อมูลสินค้า"
          description="ยังไม่มีสินค้าในระบบ"
        />
      </div>
    )
  }

  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          ภาพรวมสินค้าคงคลังและสถิติการขาย
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            จำนวนสินค้าทั้งหมด
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {totalProducts.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            รายการสินค้า
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">
            มูลค่าสินค้าคงคลัง
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatTHB(totalValue)}
          </div>
          <div className="text-xs text-gray-500">
            บาท
          </div>
        </Card>
      </div>
    </div>
  )
}