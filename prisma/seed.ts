import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting StockFlow database seeding...");

  // Clean existing demo data if any
  await prisma.stockAdjustment.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. PRIMARY DEMO TENANT: Apex Electronics & Retail
  const demoOrg = await prisma.organization.create({
    data: {
      name: "Apex Electronics & Retail",
      defaultThreshold: 10,
      currency: "USD",
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@stockflow.com",
      name: "Alex Sterling (Store Manager)",
      passwordHash,
      organizationId: demoOrg.id,
    },
  });

  console.log(`Created Demo Org: ${demoOrg.name} (${demoOrg.id}) with User: ${demoUser.email}`);

  // Realistic product catalog with diverse states: Healthy, Low Stock, Out of Stock
  const productsData = [
    {
      name: "UltraWide 34-inch Curved Gaming Monitor",
      sku: "MON-UW-34C",
      description: "144Hz, 1ms, WQHD 3440x1440 IPS panel with USB-C 90W power delivery.",
      quantity: 38,
      costPrice: 420.0,
      sellingPrice: 699.99,
      lowStockThreshold: 12,
    },
    {
      name: "Ergonomic Mesh Task Chair",
      sku: "CHR-ERG-M01",
      description: "Adjustable lumbar support, 3D armrests, breathable elastomeric mesh.",
      quantity: 24,
      costPrice: 110.0,
      sellingPrice: 229.0,
      lowStockThreshold: 8,
    },
    {
      name: "Mechanical Keyboard - Wireless RGB",
      sku: "KEY-RGB-WL",
      description: "Hot-swappable tactile switches, Bluetooth 5.1 & 2.4GHz dual mode.",
      quantity: 52,
      costPrice: 45.0,
      sellingPrice: 119.5,
      lowStockThreshold: 15,
    },
    {
      name: "Precision Wireless Optical Mouse",
      sku: "MOU-OPT-01",
      description: "Ergonomic 4000 DPI sensor, quiet click buttons, USB-C rechargeable.",
      quantity: 65,
      costPrice: 18.5,
      sellingPrice: 49.99,
      lowStockThreshold: null, // Uses org default (10)
    },
    {
      name: "Noise-Cancelling Studio Headphones",
      sku: "AUD-NCH-700",
      description: "Hybrid active noise cancellation with 40-hour battery life and LDAC.",
      quantity: 19,
      costPrice: 95.0,
      sellingPrice: 199.0,
      lowStockThreshold: 10,
    },
    // LOW STOCK ITEMS (Below or equal to threshold)
    {
      name: "Thunderbolt 4 Multi-Port Docking Station",
      sku: "DCK-TB4-PRO",
      description: "Dual 4K 60Hz HDMI/DP, 100W PD charging, Gigabit Ethernet, SD reader.",
      quantity: 4, // LOW STOCK (threshold 10)
      costPrice: 130.0,
      sellingPrice: 249.99,
      lowStockThreshold: 10,
    },
    {
      name: "4K HDR Streaming Webcam with Dual Mic",
      sku: "CAM-4K-STR",
      description: "AI auto-framing, dual stereo noise-reducing microphones, privacy shutter.",
      quantity: 6, // LOW STOCK (threshold 12)
      costPrice: 65.0,
      sellingPrice: 129.99,
      lowStockThreshold: 12,
    },
    {
      name: "USB-C to DisplayPort 1.4 Braided Cable (2m)",
      sku: "CAB-USBC-DP",
      description: "Supports 8K@60Hz, 4K@144Hz, nylon braided durable jacket.",
      quantity: 8, // LOW STOCK (uses org default 10)
      costPrice: 7.2,
      sellingPrice: 21.99,
      lowStockThreshold: null,
    },
    // OUT OF STOCK ITEMS (0 quantity)
    {
      name: "Smart MagSafe Dual Wireless Charger",
      sku: "CHG-MAG-2X",
      description: "15W fast magnetic wireless charging stand for iPhone and Apple Watch.",
      quantity: 0, // OUT OF STOCK
      costPrice: 32.0,
      sellingPrice: 79.99,
      lowStockThreshold: 15,
    },
    {
      name: "Adjustable Aluminum Laptop Riser",
      sku: "ACC-LAP-STN",
      description: "Heavy-duty CNC aluminum alloy with heat dissipation ventilation.",
      quantity: 0, // OUT OF STOCK
      costPrice: 16.5,
      sellingPrice: 39.99,
      lowStockThreshold: 10,
    },
    // ADDITIONAL REALISTIC PRODUCTS
    {
      name: "Extended Desk Mat - Waterproof Felt (90x40cm)",
      sku: "MAT-EXT-GRY",
      description: "Water-resistant micro-woven surface with anti-slip rubber base.",
      quantity: 42,
      costPrice: 8.0,
      sellingPrice: 24.99,
      lowStockThreshold: 10,
    },
    {
      name: "Smart Biometric Security Padlock",
      sku: "SEC-BIO-LCK",
      description: "Instant fingerprint recognition, Bluetooth unlock app, waterproof IP65.",
      quantity: 5, // LOW STOCK (threshold 10)
      costPrice: 22.0,
      sellingPrice: 59.99,
      lowStockThreshold: 10,
    },
  ];

  for (const item of productsData) {
    const product = await prisma.product.create({
      data: {
        organizationId: demoOrg.id,
        name: item.name,
        sku: item.sku,
        description: item.description,
        quantity: item.quantity,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        lowStockThreshold: item.lowStockThreshold,
      },
    });

    // Create realistic initial audit log
    if (item.quantity > 0) {
      await prisma.stockAdjustment.create({
        data: {
          organizationId: demoOrg.id,
          productId: product.id,
          previousQuantity: 0,
          newQuantity: item.quantity,
          adjustmentAmount: item.quantity,
          reason: "Initial warehouse stock receipt",
        },
      });
    }
  }

  // Add realistic recent adjustments for audit log demonstration
  const thunderbolt = await prisma.product.findUnique({
    where: { organizationId_sku: { organizationId: demoOrg.id, sku: "DCK-TB4-PRO" } },
  });
  if (thunderbolt) {
    await prisma.stockAdjustment.create({
      data: {
        organizationId: demoOrg.id,
        productId: thunderbolt.id,
        previousQuantity: 9,
        newQuantity: 4,
        adjustmentAmount: -5,
        reason: "Customer order fulfillment batch #4812",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    });
  }

  const gamingMonitor = await prisma.product.findUnique({
    where: { organizationId_sku: { organizationId: demoOrg.id, sku: "MON-UW-34C" } },
  });
  if (gamingMonitor) {
    await prisma.stockAdjustment.create({
      data: {
        organizationId: demoOrg.id,
        productId: gamingMonitor.id,
        previousQuantity: 28,
        newQuantity: 38,
        adjustmentAmount: 10,
        reason: "Supplier restocking shipment PO-2024-089",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
    });
  }

  // 2. SECOND ISOLATED TENANT: Zenith Retail Labs (For testing & proving multi-tenant isolation)
  const tenantB = await prisma.organization.create({
    data: {
      name: "Zenith Retail Labs",
      defaultThreshold: 5,
      currency: "EUR",
    },
  });

  const tenantBUser = await prisma.user.create({
    data: {
      email: "zenith@stockflow.com",
      name: "Elena Rostova",
      passwordHash,
      organizationId: tenantB.id,
    },
  });

  await prisma.product.create({
    data: {
      organizationId: tenantB.id,
      name: "Zenith Organic Roast Coffee Beans (1kg)",
      sku: "ZEN-COF-01",
      description: "Premium single-origin Ethiopian beans.",
      quantity: 120,
      costPrice: 9.5,
      sellingPrice: 28.0,
      lowStockThreshold: 15,
    },
  });

  console.log(`Created Isolated Tenant B: ${tenantB.name} (${tenantB.id}) with User: ${tenantBUser.email}`);
  console.log("✅ StockFlow database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
