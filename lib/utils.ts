import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTHB(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("th-TH").format(num);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{9,10}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ""));
}

export function isLowStock(
  stock: number | undefined,
  threshold: number = 10
): boolean {
  return (stock || 0) < threshold;
}

export function getStockStatus(
  stock: number | undefined
): "out-of-stock" | "low-stock" | "in-stock" {
  const stockAmount = stock || 0;
  if (stockAmount === 0) return "out-of-stock";
  if (stockAmount < 10) return "low-stock";
  return "in-stock";
}

export function getStockStatusColor(stock: number | undefined): string {
  const status = getStockStatus(stock);
  switch (status) {
    case "out-of-stock":
      return "text-red-600 bg-red-100";
    case "low-stock":
      return "text-yellow-600 bg-yellow-100";
    case "in-stock":
      return "text-green-600 bg-green-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getStockStatusText(stock: number | undefined): string {
  const status = getStockStatus(stock);
  switch (status) {
    case "out-of-stock":
      return "สินค้าหมด";
    case "low-stock":
      return "สินค้าใกล้หมด";
    case "in-stock":
      return "มีสินค้า";
    default:
      return "ไม่ทราบสถานะ";
  }
}
