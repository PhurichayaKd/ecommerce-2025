"use client";

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill,
  faChartBar,
  faCheckCircle,
  faClock,
  faChartLine,
  faTrophy,
  faClipboardList,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import Button from "@/components/ui/Button";

interface OverviewTabProps {
  products: any[];
  orders: any[];
  setActiveTab: (tab: "overview" | "orders" | "products") => void;
}

export default function OverviewTab({
  products,
  orders,
  setActiveTab,
}: OverviewTabProps) {
  // Date utility functions
  const { isToday, isThisWeek, getHourFromDate, getLast7Days, isSameDay } =
    useMemo(() => {
      return {
        isToday: (date: string | Date): boolean => {
          const today = new Date();
          const checkDate = typeof date === "string" ? new Date(date) : date;
          return (
            checkDate.getDate() === today.getDate() &&
            checkDate.getMonth() === today.getMonth() &&
            checkDate.getFullYear() === today.getFullYear()
          );
        },
        isThisWeek: (date: string | Date): boolean => {
          const today = new Date();
          const checkDate = typeof date === "string" ? new Date(date) : date;
          const getISOWeek = (date: Date) => {
            const target = new Date(date.valueOf());
            const dayNr = (date.getDay() + 6) % 7;
            target.setDate(target.getDate() - dayNr + 3);
            const firstThursday = target.valueOf();
            target.setMonth(0, 1);
            if (target.getDay() !== 4) {
              target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
            }
            return (
              1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
            );
          };
          const todayWeek = getISOWeek(today);
          const checkWeek = getISOWeek(checkDate);
          return (
            todayWeek === checkWeek &&
            today.getFullYear() === checkDate.getFullYear()
          );
        },
        getHourFromDate: (date: string | Date): number => {
          const dateObj = typeof date === "string" ? new Date(date) : date;
          return dateObj.getHours();
        },
        getLast7Days: (): Date[] => {
          const days = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date);
          }
          return days;
        },
        isSameDay: (date1: Date, date2: Date): boolean => {
          return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
          );
        },
      };
    }, []);

  // Calculate order statistics
  const orderStats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((order) => order.status === "success")
      .reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;
    const failedOrders = orders.filter(
      (order) => order.status === "failed"
    ).length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      failedOrders,
      successRate:
        totalOrders > 0
          ? (((totalOrders - failedOrders) / totalOrders) * 100).toFixed(1)
          : "0",
    };
  }, [orders]);

  // KPI Calculations
  const kpiData = useMemo(() => {
    // Today's sales (sum total of status=success for today)
    const todaysSales = orders
      .filter(
        (order: any) => order.status === "success" && isToday(order.createAt)
      )
      .reduce((sum, order) => sum + order.total, 0);

    // This week's sales (ISO week)
    const thisWeekSales = orders
      .filter(
        (order: any) => order.status === "success" && isThisWeek(order.createAt)
      )
      .reduce((sum, order) => sum + order.total, 0);

    // Today's successful orders count
    const todaysSuccessfulOrders = orders.filter(
      (order: any) => order.status === "success" && isToday(order.createAt)
    ).length;

    return {
      todaysSales,
      thisWeekSales,
      todaysSuccessfulOrders,
    };
  }, [orders, isToday, isThisWeek]);

  // Peak Time Analysis - Deterministic calculation
  const peakTimeData = useMemo(() => {
    // Count orders by hour for today only
    const hourlyOrders = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
    }));

    orders
      .filter((order: any) => isToday(order.createAt))
      .forEach((order: any) => {
        const hour = getHourFromDate(order.createAt);
        hourlyOrders[hour].count += 1;
      });

    // Find peak hour(s) - deterministic approach
    const maxCount = Math.max(...hourlyOrders.map((h) => h.count));
    const peakHours = hourlyOrders
      .filter((h) => h.count === maxCount && h.count > 0)
      .sort((a, b) => a.hour - b.hour); // Sort for consistent ordering

    let peakTimeText = "ไม่มีข้อมูล";
    if (peakHours.length > 0) {
      if (peakHours.length === 1) {
        const hour = peakHours[0].hour;
        peakTimeText = `พีค: ${hour.toString().padStart(2, "0")}:00–${(hour + 1).toString().padStart(2, "0")}:00`;
      } else {
        const hours = peakHours
          .map((h) => `${h.hour.toString().padStart(2, "0")}:00`)
          .join(", ");
        peakTimeText = `พีค: ${hours}`;
      }
    }

    // Calculate average for insight
    const totalOrders = hourlyOrders.reduce((sum, h) => sum + h.count, 0);
    const averagePerHour = totalOrders / 24;
    const peakVsAverage =
      maxCount > 0 && averagePerHour > 0
        ? Math.round(((maxCount - averagePerHour) / averagePerHour) * 100)
        : 0;

    return {
      hourlyOrders,
      peakTimeText,
      maxCount,
      averagePerHour,
      peakVsAverage,
    };
  }, [orders, isToday, getHourFromDate]);

  // Chart data for sales visualization
  const chartData = useMemo(() => {
    // Hourly sales for today
    const todayHourlySales = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      sales: 0,
      orders: 0,
    }));

    orders
      .filter((order: any) => isToday(order.createAt))
      .forEach((order: any) => {
        const hour = getHourFromDate(order.createAt);
        todayHourlySales[hour].orders += 1;
        if (order.status === "success") {
          todayHourlySales[hour].sales += order.total;
        }
      });

    // Top 5 products by quantity sold
    const productSales: {
      [key: string]: { name: string; sales: number; revenue: number };
    } = {};

    orders.forEach((order: any) => {
      if (order.status === "success") {
        order.items.forEach((item: any) => {
          const productId = item.productId.toString();
          const product = products.find((p) => p.id.toString() === productId);
          const productName = product?.name || `สินค้า #${productId}`;

          if (!productSales[productId]) {
            productSales[productId] = {
              name: productName,
              sales: 0,
              revenue: 0,
            };
          }
          productSales[productId].sales += item.qty;
          productSales[productId].revenue += item.price * item.qty;
        });
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      todayHourlySales,
      topProducts,
    };
  }, [orders, products, isToday, getHourFromDate]);

  // Calculate stats
  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum, product) => sum + (product.stock || 0),
    0
  );
  const totalValue = products.reduce(
    (sum, product) => sum + (product.price || 0) * (product.stock || 0),
    0
  );

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FontAwesomeIcon
                icon={faMoneyBill}
                className="text-2xl text-green-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ยอดขายวันนี้</p>
              <p className="text-2xl font-bold text-green-600">
                ฿{kpiData.todaysSales.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">เฉพาะออเดอร์สำเร็จ</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FontAwesomeIcon
                icon={faChartBar}
                className="text-2xl text-blue-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                ยอดขายสัปดาห์นี้
              </p>
              <p className="text-2xl font-bold text-blue-600">
                ฿{kpiData.thisWeekSales.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">ISO Week ปัจจุบัน</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-2xl text-purple-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                ออเดอร์สำเร็จวันนี้
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {kpiData.todaysSuccessfulOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">จำนวนออเดอร์</p>
            </div>
          </div>
        </div>
      </div>

      {/* Peak Time Card */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FontAwesomeIcon
                icon={faClock}
                className="text-2xl text-orange-600"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Peak Time วันนี้
              </p>
              <p className="text-xl font-bold text-orange-600">
                {peakTimeData.peakTimeText}
              </p>
              {peakTimeData.maxCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {peakTimeData.maxCount} ออเดอร์ในช่วงพีค
                  {peakTimeData.peakVsAverage > 0 && (
                    <span className="text-orange-600 font-medium">
                      {" "}
                      (สูงกว่าค่าเฉลี่ย +{peakTimeData.peakVsAverage}%)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              อัปเดต:{" "}
              {new Date().toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
          ยอดขายรายชั่วโมง (วันนี้)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData.todayHourlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tick={{ fontSize: 12 }} interval={1} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `฿${value.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value, name) => [
                name === "sales"
                  ? `฿${value.toLocaleString()}`
                  : `${value} ออเดอร์`,
                name === "sales" ? "ยอดขาย" : "จำนวนออเดอร์",
              ]}
              labelFormatter={(label) => `เวลา: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products Section */}
      {chartData.topProducts.length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FontAwesomeIcon icon={faTrophy} className="mr-2" />
            Top 5 สินค้าขายดี (รวม qty)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">
                      สินค้า
                    </th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">
                      จำนวนขาย
                    </th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">
                      รายได้
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.topProducts.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="py-2 text-sm text-gray-900 text-right">
                        {product.sales} ชิ้น
                      </td>
                      <td className="py-2 text-sm text-gray-900 text-right">
                        ฿{product.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value} ชิ้น`, "ยอดขาย"]} />
                  <Bar dataKey="sales" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
            สรุปออเดอร์
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ออเดอร์ทั้งหมด:</span>
              <span className="text-sm font-medium">
                {orderStats.totalOrders} รายการ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">รายได้รวม:</span>
              <span className="text-sm font-medium text-green-600">
                ฿{orderStats.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">อัตราสำเร็จ:</span>
              <span className="text-sm font-medium text-blue-600">
                {orderStats.successRate}%
              </span>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => setActiveTab("orders")}
                variant="outline"
                className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                ดูรายละเอียดออเดอร์
              </Button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FontAwesomeIcon icon={faBox} className="mr-2" />
            สรุปสินค้า
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">สินค้าทั้งหมด:</span>
              <span className="text-sm font-medium">
                {totalProducts} รายการ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">สต็อกรวม:</span>
              <span className="text-sm font-medium">
                {totalStock.toLocaleString()} ชิ้น
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">มูลค่าสินค้า:</span>
              <span className="text-sm font-medium text-yellow-600">
                ฿{totalValue.toLocaleString()}
              </span>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => setActiveTab("products")}
                variant="outline"
                className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                จัดการสินค้า
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
