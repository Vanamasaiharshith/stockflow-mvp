import { prisma } from "../lib/db/prisma";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import { getDashboardMetrics } from "../lib/services/dashboard.service";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
} from "../lib/services/product.service";
import { adjustStock } from "../lib/services/stock.service";
import { getInventoryInsights } from "../lib/services/insights.service";
import {
  updateOrganizationSettings,
  updateInventorySettings,
  updateAccountSettings,
} from "../lib/services/organization.service";
import { getStockStatus } from "../lib/utils/format";

async function runTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING STOCKFLOW COMPREHENSIVE WORKFLOW TESTS");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // TEST 1 & 2: Signup & Org Creation
    console.log("--- 1. Testing Signup & Organization Creation ---");
    const testOrg = await prisma.organization.create({
      data: {
        name: "Test Alpha Corp",
        defaultThreshold: 10,
        currency: "USD",
      },
    });

    const testPasswordHash = await hashPassword("securePassword123");
    const testUser = await prisma.user.create({
      data: {
        name: "Test Runner",
        email: `tester-${Date.now()}@test.com`,
        passwordHash: testPasswordHash,
        organizationId: testOrg.id,
      },
    });

    assert(Boolean(testOrg.id), "Organization created successfully");
    assert(Boolean(testUser.id), "User created and linked to organization");
    assert(testUser.organizationId === testOrg.id, "User belongs to created organization");

    // TEST 3: Login & Password Verification
    console.log("\n--- 2. Testing Password Verification (Login logic) ---");
    const passwordMatch = await verifyPassword("securePassword123", testUser.passwordHash);
    const passwordMismatch = await verifyPassword("wrongPassword", testUser.passwordHash);
    assert(passwordMatch === true, "Valid password hashes verify successfully");
    assert(passwordMismatch === false, "Invalid password fails verification");

    // TEST 4 & 5: Product Creation & SKU Uniqueness
    console.log("\n--- 3. Testing Product Creation & Scoped SKU Uniqueness ---");
    const p1 = await createProduct(testOrg.id, {
      name: "Wireless Charging Pad",
      sku: "WCP-001",
      description: "Fast qi wireless pad",
      quantity: 50,
      costPrice: 15.0,
      sellingPrice: 35.0,
      lowStockThreshold: 10,
    });
    assert(Boolean(p1.id), "Product created with initial quantity 50");
    assert(p1.sku === "WCP-001", "SKU stored in uppercase");

    // Test duplicate SKU rejection in same organization
    let duplicateRejected = false;
    try {
      await createProduct(testOrg.id, {
        name: "Duplicate Pad",
        sku: "WCP-001",
        description: null,
        quantity: 10,
        costPrice: 10,
        sellingPrice: 20,
        lowStockThreshold: null,
      });
    } catch {
      duplicateRejected = true;
    }
    assert(duplicateRejected, "Duplicate SKU within same organization is strictly prevented");

    // TEST 6: Product Editing
    console.log("\n--- 4. Testing Product Editing ---");
    const p1Updated = await updateProduct(testOrg.id, p1.id, {
      name: "Wireless Charging Pad Pro",
      sku: "WCP-001-PRO",
      description: "Updated description",
      quantity: 55,
      costPrice: 16.0,
      sellingPrice: 38.0,
      lowStockThreshold: 12,
    });
    assert(p1Updated.name === "Wireless Charging Pad Pro", "Product name successfully updated");
    assert(p1Updated.quantity === 55, "Quantity edit handled cleanly");

    // TEST 7: Stock Adjustment (Increase and Decrease)
    console.log("\n--- 5. Testing Stock Adjustment Logic & Protection against Negative Stock ---");
    const adjustPlus = await adjustStock(testOrg.id, {
      productId: p1.id,
      adjustmentAmount: 15,
      reason: "Restocked inventory",
    });
    assert(adjustPlus.product.quantity === 70, "Stock increased from 55 to 70 units (+15)");

    const adjustMinus = await adjustStock(testOrg.id, {
      productId: p1.id,
      adjustmentAmount: -20,
      reason: "Shipped orders",
    });
    assert(adjustMinus.product.quantity === 50, "Stock decreased from 70 to 50 units (-20)");

    let negativePrevented = false;
    try {
      await adjustStock(testOrg.id, {
        productId: p1.id,
        adjustmentAmount: -999, // Exceeds 50 units!
        reason: "Excessive reduction",
      });
    } catch {
      negativePrevented = true;
    }
    assert(negativePrevented, "Negative stock quantity was successfully blocked");

    // TEST 8: Low Stock & Threshold Status Calculation
    console.log("\n--- 6. Testing Stock Status Calculation ---");
    // Healthy: quantity > threshold
    const statusHealthy = getStockStatus(25, 10, 10);
    assert(statusHealthy.status === "HEALTHY", "Quantity > threshold correctly calculates as HEALTHY");

    // Low Stock: 0 < quantity <= threshold
    const statusLow = getStockStatus(8, 10, 10);
    assert(statusLow.status === "LOW_STOCK", "Quantity <= threshold correctly calculates as LOW_STOCK");

    // Out of Stock: quantity === 0
    const statusOut = getStockStatus(0, 10, 10);
    assert(statusOut.status === "OUT_OF_STOCK", "Quantity == 0 correctly calculates as OUT_OF_STOCK");

    // Inherit default org threshold when product threshold is null
    const statusInherited = getStockStatus(12, null, 15);
    assert(
      statusInherited.effectiveThreshold === 15 && statusInherited.status === "LOW_STOCK",
      "Product with null threshold properly inherits organization default threshold (15)"
    );

    // TEST 9: Search & Filters
    console.log("\n--- 7. Testing Search & Filtering ---");
    const p2 = await createProduct(testOrg.id, {
      name: "USB-C Hub Multiport",
      sku: "HUB-USBC",
      description: "7-in-1 hub",
      quantity: 3, // Low stock (threshold 10)
      costPrice: 20,
      sellingPrice: 45,
      lowStockThreshold: 10,
    });

    const p3 = await createProduct(testOrg.id, {
      name: "Out of Stock Cable",
      sku: "CAB-OOS",
      description: "Deprecated cable",
      quantity: 0, // Out of stock
      costPrice: 2,
      sellingPrice: 10,
      lowStockThreshold: 5,
    });

    const searchResult = await getProducts(
      testOrg.id,
      { search: "Multiport", status: "ALL", sortBy: "name", sortOrder: "asc", page: 1, limit: 10 },
      10
    );
    assert(searchResult.products.length === 1 && searchResult.products[0].sku === "HUB-USBC", "Search by query works");

    const lowStockFilterResult = await getProducts(
      testOrg.id,
      { status: "LOW_STOCK", sortBy: "quantity", sortOrder: "asc", page: 1, limit: 10 },
      10
    );
    assert(
      lowStockFilterResult.products.some((p) => p.sku === "HUB-USBC"),
      "Filter by LOW_STOCK accurately isolates items"
    );

    // TEST 10: Multi-Tenant Isolation
    console.log("\n--- 8. Testing Multi-Tenant Boundary Security ---");
    const tenantB = await prisma.organization.create({
      data: { name: "Tenant Beta", defaultThreshold: 5, currency: "EUR" },
    });

    const pTenantB = await createProduct(tenantB.id, {
      name: "Beta Secret Product",
      sku: "BETA-SEC-01",
      description: "Confidential item",
      quantity: 100,
      costPrice: 50,
      sellingPrice: 120,
      lowStockThreshold: 5,
    });

    // Test that Organization Alpha CANNOT read Beta's product
    const crossTenantRead = await getProductById(testOrg.id, pTenantB.id);
    assert(crossTenantRead === null, "Tenant Alpha cannot read Tenant Beta's product (isolated)");

    // Test that Organization Alpha CANNOT edit Beta's product
    let crossTenantEditBlocked = false;
    try {
      await updateProduct(testOrg.id, pTenantB.id, {
        name: "Hacked by Alpha",
        sku: "HACK",
        description: null,
        quantity: 1,
        costPrice: 1,
        sellingPrice: 1,
        lowStockThreshold: null,
      });
    } catch {
      crossTenantEditBlocked = true;
    }
    assert(crossTenantEditBlocked, "Tenant Alpha cannot modify Tenant Beta's product");

    // Test that Organization Alpha CANNOT delete Beta's product
    let crossTenantDeleteBlocked = false;
    try {
      await deleteProduct(testOrg.id, pTenantB.id);
    } catch {
      crossTenantDeleteBlocked = true;
    }
    assert(crossTenantDeleteBlocked, "Tenant Alpha cannot delete Tenant Beta's product");

    // Test that Organization Alpha CANNOT adjust stock of Beta's product
    let crossTenantAdjustBlocked = false;
    try {
      await adjustStock(testOrg.id, {
        productId: pTenantB.id,
        adjustmentAmount: -50,
        reason: "Malicious adjustment",
      });
    } catch {
      crossTenantAdjustBlocked = true;
    }
    assert(crossTenantAdjustBlocked, "Tenant Alpha cannot adjust stock of Tenant Beta's product");

    // TEST 11: Dashboard Metrics & Financial Valuation Calculations
    console.log("\n--- 9. Testing Dashboard & Insights Valuation Calculations ---");
    const metrics = await getDashboardMetrics(testOrg.id, 10);
    assert(metrics.kpis.totalProducts === 3, "Dashboard totalProducts count is accurate");
    assert(metrics.kpis.totalStockUnits === 50 + 3 + 0, "Dashboard totalStockUnits sum is accurate (53)");
    assert(metrics.kpis.lowStockCount === 1, "Dashboard lowStockCount accurately reflects 1 item");
    assert(metrics.kpis.outOfStockCount === 1, "Dashboard outOfStockCount accurately reflects 1 item");

    const insights = await getInventoryInsights(testOrg.id, 10);
    assert(insights.summary.totalStockUnits === 53, "Insights summary stock units match database");
    assert(insights.highestStockProducts[0].name === "Wireless Charging Pad Pro", "Highest stock products ranked accurately");

    // TEST 12: Settings Updates
    console.log("\n--- 10. Testing Organization & Inventory Settings ---");
    const updatedOrg = await updateOrganizationSettings(testOrg.id, { name: "Test Alpha Corp Updated" });
    assert(updatedOrg.name === "Test Alpha Corp Updated", "Organization name updated successfully");

    const updatedInv = await updateInventorySettings(testOrg.id, { defaultThreshold: 20, currency: "GBP" });
    assert(updatedInv.defaultThreshold === 20 && updatedInv.currency === "GBP", "Threshold and currency updated successfully");

    const updatedAccount = await updateAccountSettings(testUser.id, { name: "Test Lead Engineer" });
    assert(updatedAccount.name === "Test Lead Engineer", "User profile name updated successfully");

    // TEST 13: Product Deletion
    console.log("\n--- 11. Testing Product Deletion ---");
    await deleteProduct(testOrg.id, p3.id);
    const checkDeleted = await getProductById(testOrg.id, p3.id);
    assert(checkDeleted === null, "Product deleted successfully and removed from database");

    // Cleanup test artifacts
    await prisma.stockAdjustment.deleteMany({ where: { organizationId: { in: [testOrg.id, tenantB.id] } } });
    await prisma.product.deleteMany({ where: { organizationId: { in: [testOrg.id, tenantB.id] } } });
    await prisma.user.deleteMany({ where: { organizationId: { in: [testOrg.id, tenantB.id] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [testOrg.id, tenantB.id] } } });

    console.log("\n=================================================");
    console.log(`🎉 ALL TESTS FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
