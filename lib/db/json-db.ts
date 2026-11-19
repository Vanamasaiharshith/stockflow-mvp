import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface OrganizationRecord {
  id: string;
  name: string;
  defaultThreshold: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionRecord {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ProductRecord {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  description: string | null;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockAdjustmentRecord {
  id: string;
  organizationId: string;
  productId: string;
  previousQuantity: number;
  newQuantity: number;
  adjustmentAmount: number;
  reason: string | null;
  createdAt: Date;
}

interface DatabaseSchema {
  organizations: OrganizationRecord[];
  users: UserRecord[];
  sessions: SessionRecord[];
  products: ProductRecord[];
  stockAdjustments: StockAdjustmentRecord[];
}

function generateId(prefix: string = "id"): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

const DATA_FILE_PATH = path.join(process.cwd(), "data", "stockflow-data.json");

const DEFAULT_BOOTSTRAP_DATA: DatabaseSchema = {
  organizations: [
    {
      id: "org_apex_1",
      name: "Apex Electronics & Retail",
      defaultThreshold: 10,
      currency: "USD",
      createdAt: new Date("2026-01-01T08:00:00.000Z"),
      updatedAt: new Date("2026-01-01T08:00:00.000Z"),
    },
    {
      id: "org_zenith_2",
      name: "Zenith Retail Labs",
      defaultThreshold: 5,
      currency: "EUR",
      createdAt: new Date("2026-01-01T08:00:00.000Z"),
      updatedAt: new Date("2026-01-01T08:00:00.000Z"),
    },
  ],
  users: [
    {
      id: "usr_demo_1",
      email: "demo@stockflow.com",
      name: "Alex Sterling (Store Manager)",
      passwordHash: "$2b$10$iKZlJaavziXe89dS.RHY5.xnE9K3S/PfKtWqc6GEML1sWqJGw7v/u",
      organizationId: "org_apex_1",
      createdAt: new Date("2026-01-01T08:00:00.000Z"),
      updatedAt: new Date("2026-01-01T08:00:00.000Z"),
    },
    {
      id: "usr_zenith_2",
      email: "zenith@stockflow.com",
      name: "Elena Rostova",
      passwordHash: "$2b$10$iKZlJaavziXe89dS.RHY5.xnE9K3S/PfKtWqc6GEML1sWqJGw7v/u",
      organizationId: "org_zenith_2",
      createdAt: new Date("2026-01-01T08:00:00.000Z"),
      updatedAt: new Date("2026-01-01T08:00:00.000Z"),
    },
  ],
  sessions: [],
  products: [
    {
      id: "prod_apex_01",
      organizationId: "org_apex_1",
      name: "UltraWide 34-inch Curved Gaming Monitor",
      sku: "MON-UW-34C",
      description: "144Hz, 1ms, WQHD 3440x1440 IPS panel with USB-C 90W power delivery.",
      quantity: 38,
      costPrice: 420.0,
      sellingPrice: 699.99,
      lowStockThreshold: 12,
      createdAt: new Date("2026-01-01T09:00:00.000Z"),
      updatedAt: new Date("2026-01-01T09:00:00.000Z"),
    },
    {
      id: "prod_apex_02",
      organizationId: "org_apex_1",
      name: "Ergonomic Mesh Task Chair",
      sku: "CHR-ERG-M01",
      description: "Adjustable lumbar support, 3D armrests, breathable elastomeric mesh.",
      quantity: 24,
      costPrice: 110.0,
      sellingPrice: 229.0,
      lowStockThreshold: 8,
      createdAt: new Date("2026-01-01T09:05:00.000Z"),
      updatedAt: new Date("2026-01-01T09:05:00.000Z"),
    },
    {
      id: "prod_apex_03",
      organizationId: "org_apex_1",
      name: "Mechanical Keyboard - Wireless RGB",
      sku: "KEY-RGB-WL",
      description: "Hot-swappable tactile switches, Bluetooth 5.1 & 2.4GHz dual mode.",
      quantity: 52,
      costPrice: 45.0,
      sellingPrice: 119.5,
      lowStockThreshold: 15,
      createdAt: new Date("2026-01-01T09:10:00.000Z"),
      updatedAt: new Date("2026-01-01T09:10:00.000Z"),
    },
    {
      id: "prod_apex_04",
      organizationId: "org_apex_1",
      name: "Precision Wireless Optical Mouse",
      sku: "MOU-OPT-01",
      description: "Ergonomic 4000 DPI sensor, quiet click buttons, USB-C rechargeable.",
      quantity: 65,
      costPrice: 18.5,
      sellingPrice: 49.99,
      lowStockThreshold: null,
      createdAt: new Date("2026-01-01T09:15:00.000Z"),
      updatedAt: new Date("2026-01-01T09:15:00.000Z"),
    },
    {
      id: "prod_apex_05",
      organizationId: "org_apex_1",
      name: "Noise-Cancelling Studio Headphones",
      sku: "AUD-NCH-700",
      description: "Hybrid active noise cancellation with 40-hour battery life and LDAC.",
      quantity: 19,
      costPrice: 95.0,
      sellingPrice: 199.0,
      lowStockThreshold: 10,
      createdAt: new Date("2026-01-01T09:20:00.000Z"),
      updatedAt: new Date("2026-01-01T09:20:00.000Z"),
    },
    {
      id: "prod_apex_06",
      organizationId: "org_apex_1",
      name: "Thunderbolt 4 Multi-Port Docking Station",
      sku: "DCK-TB4-PRO",
      description: "Dual 4K 60Hz HDMI/DP, 100W PD charging, Gigabit Ethernet, SD reader.",
      quantity: 4,
      costPrice: 130.0,
      sellingPrice: 249.99,
      lowStockThreshold: 10,
      createdAt: new Date("2026-01-01T09:25:00.000Z"),
      updatedAt: new Date("2026-01-01T09:25:00.000Z"),
    },
    {
      id: "prod_apex_07",
      organizationId: "org_apex_1",
      name: "4K HDR Streaming Webcam with Dual Mic",
      sku: "CAM-4K-STR",
      description: "AI auto-framing, dual stereo noise-reducing microphones, privacy shutter.",
      quantity: 6,
      costPrice: 65.0,
      sellingPrice: 129.99,
      lowStockThreshold: 12,
      createdAt: new Date("2026-01-01T09:30:00.000Z"),
      updatedAt: new Date("2026-01-01T09:30:00.000Z"),
    },
    {
      id: "prod_apex_08",
      organizationId: "org_apex_1",
      name: "USB-C to DisplayPort 1.4 Braided Cable (2m)",
      sku: "CAB-USBC-DP",
      description: "Supports 8K@60Hz, 4K@144Hz, nylon braided durable jacket.",
      quantity: 8,
      costPrice: 7.2,
      sellingPrice: 21.99,
      lowStockThreshold: null,
      createdAt: new Date("2026-01-01T09:35:00.000Z"),
      updatedAt: new Date("2026-01-01T09:35:00.000Z"),
    },
    {
      id: "prod_apex_09",
      organizationId: "org_apex_1",
      name: "Smart MagSafe Dual Wireless Charger",
      sku: "CHG-MAG-2X",
      description: "15W fast magnetic wireless charging stand for iPhone and Apple Watch.",
      quantity: 0,
      costPrice: 32.0,
      sellingPrice: 79.99,
      lowStockThreshold: 15,
      createdAt: new Date("2026-01-01T09:40:00.000Z"),
      updatedAt: new Date("2026-01-01T09:40:00.000Z"),
    },
    {
      id: "prod_apex_10",
      organizationId: "org_apex_1",
      name: "Adjustable Aluminum Laptop Riser",
      sku: "ACC-LAP-STN",
      description: "Heavy-duty CNC aluminum alloy with heat dissipation ventilation.",
      quantity: 0,
      costPrice: 16.5,
      sellingPrice: 39.99,
      lowStockThreshold: 10,
      createdAt: new Date("2026-01-01T09:45:00.000Z"),
      updatedAt: new Date("2026-01-01T09:45:00.000Z"),
    },
    {
      id: "prod_apex_11",
      organizationId: "org_apex_1",
      name: "Extended Desk Mat - Waterproof Felt (90x40cm)",
      sku: "MAT-EXT-GRY",
      description: "Water-resistant micro-woven surface with anti-slip rubber base.",
      quantity: 42,
      costPrice: 8.0,
      sellingPrice: 24.99,
      lowStockThreshold: 10,
      createdAt: new Date("2026-01-01T09:50:00.000Z"),
      updatedAt: new Date("2026-01-01T09:50:00.000Z"),
    },
    {
      id: "prod_apex_12",
      organizationId: "org_apex_1",
      name: "Smart Biometric Security Padlock",
      sku: "SEC-BIO-LCK",
      description: "Instant fingerprint recognition, Bluetooth unlock app, waterproof IP65.",
      quantity: 5,
      costPrice: 22.0,
      sellingPrice: 59.99,
      lowStockThreshold: 10,
      createdAt: new Date("2026-01-01T09:55:00.000Z"),
      updatedAt: new Date("2026-01-01T09:55:00.000Z"),
    },
    {
      id: "prod_zenith_01",
      organizationId: "org_zenith_2",
      name: "Zenith Organic Roast Coffee Beans (1kg)",
      sku: "ZEN-COF-01",
      description: "Premium single-origin Ethiopian beans.",
      quantity: 120,
      costPrice: 9.5,
      sellingPrice: 28.0,
      lowStockThreshold: 15,
      createdAt: new Date("2026-01-01T10:00:00.000Z"),
      updatedAt: new Date("2026-01-01T10:00:00.000Z"),
    },
  ],
  stockAdjustments: [
    {
      id: "adj_01",
      organizationId: "org_apex_1",
      productId: "prod_apex_01",
      previousQuantity: 28,
      newQuantity: 38,
      adjustmentAmount: 10,
      reason: "Supplier restocking shipment PO-2024-089",
      createdAt: new Date("2026-01-02T10:00:00.000Z"),
    },
    {
      id: "adj_02",
      organizationId: "org_apex_1",
      productId: "prod_apex_06",
      previousQuantity: 9,
      newQuantity: 4,
      adjustmentAmount: -5,
      reason: "Customer order fulfillment batch #4812",
      createdAt: new Date("2026-01-02T13:00:00.000Z"),
    },
    {
      id: "adj_03",
      organizationId: "org_apex_1",
      productId: "prod_apex_03",
      previousQuantity: 40,
      newQuantity: 52,
      adjustmentAmount: 12,
      reason: "Q1 warehouse transfer receipt",
      createdAt: new Date("2026-01-02T14:30:00.000Z"),
    },
    {
      id: "adj_04",
      organizationId: "org_apex_1",
      productId: "prod_apex_07",
      previousQuantity: 10,
      newQuantity: 6,
      adjustmentAmount: -4,
      reason: "Direct online dispatch",
      createdAt: new Date("2026-01-02T15:45:00.000Z"),
    },
  ],
};

class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const raw = fs.readFileSync(DATA_FILE_PATH, "utf8");
        const parsed = JSON.parse(raw);
        return {
          organizations: (parsed.organizations || []).map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt),
            updatedAt: new Date(o.updatedAt),
          })),
          users: (parsed.users || []).map((u: any) => ({
            ...u,
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt),
          })),
          sessions: (parsed.sessions || []).map((s: any) => ({
            ...s,
            expiresAt: new Date(s.expiresAt),
            createdAt: new Date(s.createdAt),
          })),
          products: (parsed.products || []).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          })),
          stockAdjustments: (parsed.stockAdjustments || []).map((a: any) => ({
            ...a,
            createdAt: new Date(a.createdAt),
          })),
        };
      }
    } catch {
      // Fallback
    }
    return JSON.parse(JSON.stringify(DEFAULT_BOOTSTRAP_DATA));
  }

  private persist() {
    try {
      const dir = path.dirname(DATA_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(this.data, null, 2), "utf8");
    } catch {
      // Gracefully continue
    }
  }

  public get organization() {
    return {
      create: async ({ data }: { data: { name: string; defaultThreshold?: number; currency?: string } }): Promise<OrganizationRecord> => {
        const now = new Date();
        const record: OrganizationRecord = {
          id: generateId("org"),
          name: data.name,
          defaultThreshold: data.defaultThreshold ?? 10,
          currency: data.currency ?? "USD",
          createdAt: now,
          updatedAt: now,
        };
        this.data.organizations.push(record);
        this.persist();
        return record;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<OrganizationRecord> }): Promise<OrganizationRecord> => {
        const index = this.data.organizations.findIndex((o) => o.id === where.id);
        if (index === -1) throw new Error("Organization not found");
        this.data.organizations[index] = {
          ...this.data.organizations[index],
          ...data,
          updatedAt: new Date(),
        };
        this.persist();
        return this.data.organizations[index];
      },
      findUnique: async ({ where }: { where: { id: string } }): Promise<OrganizationRecord | null> => {
        return this.data.organizations.find((o) => o.id === where.id) || null;
      },
      findFirst: async ({ where }: { where?: { id?: string } }): Promise<OrganizationRecord | null> => {
        return this.data.organizations.find((o) => (where?.id ? o.id === where.id : true)) || null;
      },
      deleteMany: async (_params?: any): Promise<{ count: number }> => {
        this.data.organizations = [];
        this.persist();
        return { count: 0 };
      },
    };
  }

  public get user() {
    return {
      findUnique: async ({ where }: { where: { email?: string; id?: string } }): Promise<UserRecord | null> => {
        if (where.email) {
          return this.data.users.find((u) => u.email.toLowerCase() === where.email?.toLowerCase()) || null;
        }
        if (where.id) {
          return this.data.users.find((u) => u.id === where.id) || null;
        }
        return null;
      },
      findFirst: async ({ where }: { where: Partial<UserRecord> }): Promise<UserRecord | null> => {
        return (
          this.data.users.find((u) => {
            if (where.email && u.email.toLowerCase() !== where.email.toLowerCase()) return false;
            if (where.id && u.id !== where.id) return false;
            if (where.organizationId && u.organizationId !== where.organizationId) return false;
            return true;
          }) || null
        );
      },
      create: async ({
        data,
      }: {
        data: { name: string; email: string; passwordHash: string; organizationId: string };
      }): Promise<UserRecord> => {
        const now = new Date();
        const record: UserRecord = {
          id: generateId("usr"),
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          organizationId: data.organizationId,
          createdAt: now,
          updatedAt: now,
        };
        this.data.users.push(record);
        this.persist();
        return record;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<UserRecord> }): Promise<UserRecord> => {
        const index = this.data.users.findIndex((u) => u.id === where.id);
        if (index === -1) throw new Error("User not found");
        this.data.users[index] = {
          ...this.data.users[index],
          ...data,
          updatedAt: new Date(),
        };
        this.persist();
        return this.data.users[index];
      },
      deleteMany: async (_params?: any): Promise<{ count: number }> => {
        this.data.users = [];
        this.persist();
        return { count: 0 };
      },
    };
  }

  public get session() {
    return {
      create: async ({ data }: { data: { token: string; userId: string; expiresAt: Date } }): Promise<SessionRecord> => {
        const record: SessionRecord = {
          id: generateId("sess"),
          token: data.token,
          userId: data.userId,
          expiresAt: new Date(data.expiresAt),
          createdAt: new Date(),
        };
        this.data.sessions.push(record);
        this.persist();
        return record;
      },
      findUnique: async ({
        where,
        include,
      }: {
        where: { token?: string; id?: string };
        include?: any;
      }): Promise<any> => {
        const s = this.data.sessions.find((sess) =>
          where.token ? sess.token === where.token : sess.id === where.id
        );
        if (!s) return null;

        if (include?.user) {
          const user = this.data.users.find((u) => u.id === s.userId);
          if (!user) return null;

          let organization = undefined;
          if (include.user.include?.organization) {
            organization = this.data.organizations.find((o) => o.id === user.organizationId);
          }

          return {
            ...s,
            user: {
              ...user,
              organization,
            },
          };
        }

        return s;
      },
      delete: async ({ where }: { where: { id: string } }): Promise<any> => {
        const index = this.data.sessions.findIndex((s) => s.id === where.id);
        if (index !== -1) {
          const removed = this.data.sessions.splice(index, 1);
          this.persist();
          return removed[0];
        }
        return null;
      },
      deleteMany: async (_where?: any): Promise<{ count: number }> => {
        if (_where?.where?.token) {
          this.data.sessions = this.data.sessions.filter((s) => s.token !== _where.where.token);
        } else {
          this.data.sessions = [];
        }
        this.persist();
        return { count: 0 };
      },
    };
  }

  public get product() {
    return {
      findMany: async ({
        where = {},
        orderBy = { updatedAt: "desc" },
        include,
      }: {
        where?: {
          organizationId?: string;
          OR?: Array<{ [key: string]: { contains: string } }>;
        };
        orderBy?: { [key: string]: "asc" | "desc" };
        include?: { _count?: { select?: { stockAdjustments?: boolean } } };
      } = {}): Promise<any[]> => {
        let results = this.data.products.filter((p) => {
          if (where.organizationId && p.organizationId !== where.organizationId) return false;
          if (where.OR && where.OR.length > 0) {
            const matchesOr = where.OR.some((cond) => {
              if (cond.name?.contains) {
                return p.name.toLowerCase().includes(cond.name.contains.toLowerCase());
              }
              if (cond.sku?.contains) {
                return p.sku.toLowerCase().includes(cond.sku.contains.toLowerCase());
              }
              if (cond.description?.contains) {
                return (p.description || "")
                  .toLowerCase()
                  .includes(cond.description.contains.toLowerCase());
              }
              return false;
            });
            if (!matchesOr) return false;
          }
          return true;
        });

        // Sorting
        const [sortField, sortOrder] = Object.entries(orderBy)[0] || ["updatedAt", "desc"];
        results.sort((a: any, b: any) => {
          let valA = a[sortField];
          let valB = b[sortField];

          if (valA instanceof Date) valA = valA.getTime();
          if (valB instanceof Date) valB = valB.getTime();

          if (typeof valA === "string") {
            const cmp = valA.localeCompare(valB);
            return sortOrder === "asc" ? cmp : -cmp;
          }

          if (sortOrder === "asc") return valA > valB ? 1 : -1;
          return valA < valB ? 1 : -1;
        });

        return results.map((p) => {
          const adjCount = this.data.stockAdjustments.filter((a) => a.productId === p.id).length;
          return {
            ...p,
            _count: { stockAdjustments: adjCount },
          };
        });
      },

      findFirst: async ({
        where,
        include,
      }: {
        where: { id?: string; organizationId?: string };
        include?: { stockAdjustments?: { orderBy?: any; take?: number } };
      }): Promise<any> => {
        const product = this.data.products.find((p) => {
          if (where.id && p.id !== where.id) return false;
          if (where.organizationId && p.organizationId !== where.organizationId) return false;
          return true;
        });

        if (!product) return null;

        if (include?.stockAdjustments) {
          let adjs = this.data.stockAdjustments
            .filter((a) => a.productId === product.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          if (include.stockAdjustments.take) {
            adjs = adjs.slice(0, include.stockAdjustments.take);
          }
          return {
            ...product,
            stockAdjustments: adjs,
          };
        }

        return product;
      },

      findUnique: async ({
        where,
      }: {
        where:
          | { id: string }
          | { organizationId_sku: { organizationId: string; sku: string } };
      }): Promise<ProductRecord | null> => {
        if ("id" in where) {
          return this.data.products.find((p) => p.id === where.id) || null;
        }
        if ("organizationId_sku" in where) {
          const { organizationId, sku } = where.organizationId_sku;
          return (
            this.data.products.find(
              (p) =>
                p.organizationId === organizationId &&
                p.sku.toUpperCase() === sku.toUpperCase()
            ) || null
          );
        }
        return null;
      },

      create: async ({
        data,
      }: {
        data: {
          organizationId: string;
          name: string;
          sku: string;
          description?: string | null;
          quantity?: number;
          costPrice?: number;
          sellingPrice?: number;
          lowStockThreshold?: number | null;
        };
      }): Promise<ProductRecord> => {
        const now = new Date();
        const record: ProductRecord = {
          id: generateId("prod"),
          organizationId: data.organizationId,
          name: data.name,
          sku: data.sku.toUpperCase(),
          description: data.description ?? null,
          quantity: data.quantity ?? 0,
          costPrice: data.costPrice ?? 0,
          sellingPrice: data.sellingPrice ?? 0,
          lowStockThreshold: data.lowStockThreshold ?? null,
          createdAt: now,
          updatedAt: now,
        };
        this.data.products.push(record);
        this.persist();
        return record;
      },

      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<ProductRecord>;
      }): Promise<ProductRecord> => {
        const index = this.data.products.findIndex((p) => p.id === where.id);
        if (index === -1) throw new Error("Product not found");
        this.data.products[index] = {
          ...this.data.products[index],
          ...data,
          sku: data.sku ? data.sku.toUpperCase() : this.data.products[index].sku,
          updatedAt: new Date(),
        };
        this.persist();
        return this.data.products[index];
      },

      delete: async ({ where }: { where: { id: string } }): Promise<ProductRecord> => {
        const index = this.data.products.findIndex((p) => p.id === where.id);
        if (index === -1) throw new Error("Product not found");
        const [removed] = this.data.products.splice(index, 1);
        this.data.stockAdjustments = this.data.stockAdjustments.filter(
          (a) => a.productId !== where.id
        );
        this.persist();
        return removed;
      },

      deleteMany: async (_params?: any): Promise<{ count: number }> => {
        this.data.products = [];
        this.persist();
        return { count: 0 };
      },

      count: async ({ where }: { where?: { organizationId?: string } } = {}): Promise<number> => {
        if (!where?.organizationId) return this.data.products.length;
        return this.data.products.filter((p) => p.organizationId === where.organizationId).length;
      },
    };
  }

  public get stockAdjustment() {
    return {
      create: async ({
        data,
      }: {
        data: {
          organizationId: string;
          productId: string;
          previousQuantity: number;
          newQuantity: number;
          adjustmentAmount: number;
          reason?: string | null;
          createdAt?: Date;
        };
      }): Promise<StockAdjustmentRecord> => {
        const record: StockAdjustmentRecord = {
          id: generateId("adj"),
          organizationId: data.organizationId,
          productId: data.productId,
          previousQuantity: data.previousQuantity,
          newQuantity: data.newQuantity,
          adjustmentAmount: data.adjustmentAmount,
          reason: data.reason ?? "Manual adjustment",
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        };
        this.data.stockAdjustments.unshift(record);
        this.persist();
        return record;
      },

      findMany: async ({
        where = {},
        include,
        orderBy = { createdAt: "desc" },
        take,
      }: {
        where?: { organizationId?: string; productId?: string };
        include?: any;
        orderBy?: { [key: string]: "asc" | "desc" };
        take?: number;
      } = {}): Promise<any[]> => {
        let results = this.data.stockAdjustments.filter((a) => {
          if (where.organizationId && a.organizationId !== where.organizationId) return false;
          if (where.productId && a.productId !== where.productId) return false;
          return true;
        });

        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (take) {
          results = results.slice(0, take);
        }

        return results.map((a) => {
          const prod = this.data.products.find((p) => p.id === a.productId);
          return {
            ...a,
            product: prod
              ? {
                  id: prod.id,
                  name: prod.name,
                  sku: prod.sku,
                }
              : { id: a.productId, name: "Product", sku: "N/A" },
          };
        });
      },

      deleteMany: async (_params?: any): Promise<{ count: number }> => {
        this.data.stockAdjustments = [];
        this.persist();
        return { count: 0 };
      },
    };
  }

  public async $transaction<T>(fn: (tx: JsonDatabase) => Promise<T>): Promise<T> {
    return fn(this);
  }

  public async $disconnect() {
    // No-op
  }
}

const globalForDb = globalThis as unknown as {
  stockflowDb: JsonDatabase | undefined;
};

export const jsonDb = globalForDb.stockflowDb ?? new JsonDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDb.stockflowDb = jsonDb;
}
