// Test file for dual API functionality
import { getProducts } from "./api";

export async function testDualAPI() {
  try {
    console.log("🔄 Testing Dual API functionality...");

    const result = await getProducts({});

    console.log("📊 API Results:");
    console.log(`✅ Total products: ${result.data.length}`);
    console.log(`✅ Success: ${result.success}`);
    console.log(`✅ Timestamp: ${result.timestamp}`);

    if (result.data.length > 0) {
      console.log("📦 Sample products:");
      result.data.slice(0, 3).forEach((product, index) => {
        console.log(
          `${index + 1}. ${product.name} - ฿${product.price} (${product.category})`
        );
      });
    }

    // Test categories
    const categories = Array.from(new Set(result.data.map((p) => p.category)));
    console.log(`🏷️ Categories found: ${categories.length}`);
    console.log(
      `📋 Categories: ${categories.slice(0, 5).join(", ")}${categories.length > 5 ? "..." : ""}`
    );

    return result;
  } catch (error) {
    console.error("❌ Dual API test failed:", error);
    throw error;
  }
}

// Export for use in components
export default testDualAPI;
