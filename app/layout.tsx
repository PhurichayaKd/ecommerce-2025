import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/providers/QueryProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import Navigation from '@/components/layout/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mini E-commerce 2025',
  description: 'A modern e-commerce platform built with Next.js 14, TypeScript, and Tailwind CSS',
  keywords: ['e-commerce', 'nextjs', 'typescript', 'tailwindcss', 'react-query'],
  authors: [{ name: 'E-commerce Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <QueryProvider>
          <CartProvider>
            <div className="min-h-full">
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="container">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-gray-900">
                      Mini E-commerce
                    </h1>
                  </div>
                  <Navigation />
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-gray-50 border-t border-gray-200">
              <div className="container">
                <div className="py-8 text-center text-sm text-gray-600">
                  © 2025 Mini E-commerce. Built with Next.js 14 & TypeScript.
                </div>
              </div>
            </footer>
            </div>
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  )
}