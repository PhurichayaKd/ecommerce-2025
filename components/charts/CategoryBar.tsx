'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatTHB } from '@/lib/utils'

interface CategoryData {
  name: string
  count: number
  value: number
}

interface CategoryBarProps {
  data: CategoryData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-medium">
        <p className="font-medium text-gray-900 mb-1">{label}</p>
        <p className="text-sm text-gray-600">
          จำนวนสินค้า: <span className="font-medium">{payload[0].payload.count} รายการ</span>
        </p>
        <p className="text-sm text-gray-600">
          มูลค่า: <span className="font-medium text-primary-600">{formatTHB(payload[0].value)}</span>
        </p>
      </div>
    )
  }
  return null
}

const CustomXAxisTick = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={16} 
        textAnchor="middle" 
        fill="#6b7280" 
        fontSize="12"
        className="font-medium"
      >
        {payload.value.length > 10 ? `${payload.value.substring(0, 10)}...` : payload.value}
      </text>
    </g>
  )
}

export default function CategoryBar({ data }: CategoryBarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        ไม่มีข้อมูลสำหรับแสดงกราฟ
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            tick={<CustomXAxisTick />}
            axisLine={false}
            tickLine={false}
            interval={0}
            height={60}
          />
          <YAxis 
            tickFormatter={(value) => formatTHB(value, true)}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            className="hover:opacity-80 transition-opacity"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}