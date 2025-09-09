"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { formatTHB, isLowStock } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import styles from "./ProductCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping } from "@fortawesome/free-solid-svg-icons";
interface ProductCardProps {
  product: Product;
}

// Helper function to get valid image source
function getValidImageSrc(imageSrc: string | undefined): string {
  if (!imageSrc) return "/placeholder-product.svg";

  // Check if it's a relative path starting with /images/ (which doesn't exist)
  if (imageSrc.startsWith("/images/")) {
    return "/placeholder-product.svg";
  }

  // Check if it's a valid URL
  try {
    new URL(imageSrc);
    return imageSrc;
  } catch {
    return "/placeholder-product.svg";
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStockItem = isLowStock(product.stock);

  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    // Add to cart using Cart Context
    addItem(product);

    // Show feedback
    const button = e.target as HTMLButtonElement;
    const originalText = button.textContent;
    button.textContent = "✓ เพิ่มแล้ว";
    button.disabled = true;

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 1500);
  };

  return (
    <Card
      className={`${styles.productCard} group overflow-hidden transition-all duration-200 hover:shadow-medium hover:-translate-y-1`}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={getValidImageSrc(product.image)}
            alt={product.name || "Product image"}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-product.svg";
            }}
          />

          {/* Stock badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOutOfStock && (
              <Badge variant="error" size="sm">
                หมด
              </Badge>
            )}
            {!isOutOfStock && isLowStockItem && (
              <Badge variant="warning" size="sm">
                เหลือน้อย
              </Badge>
            )}
          </div>

          {/* Category badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" size="sm">
              {product.category}
            </Badge>
          </div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold text-primary-600">
              {formatTHB(product.price)}
            </div>
            <div className="text-xs text-gray-500">
              คงเหลือ {product.stock} ชิ้น
            </div>
          </div>
        </div>
      </Link>

      {/* Quick add button */}
      <div className="px-4 pb-4">
        <Button
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          variant={isOutOfStock ? "secondary" : "primary"}
          size="sm"
          className="w-full"
        >
          {isOutOfStock ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
        </Button>
      </div>
    </Card>
  );
}
