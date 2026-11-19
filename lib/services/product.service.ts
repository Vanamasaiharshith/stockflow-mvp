import { prisma } from "@/lib/db/prisma";
import { ProductInput, ProductQueryParams } from "@/lib/validations/product";
import { getStockStatus } from "@/lib/utils/format";
import { Prisma } from "@prisma/client";

export async function getProducts(
  orgId: string,
  params: ProductQueryParams,
  defaultThreshold: number
) {
  const { search, status, sortBy, sortOrder, page, limit } = params;

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    organizationId: orgId,
  };

  if (search && search.trim() !== "") {
    const s = search.trim();
    where.OR = [
      { name: { contains: s } },
      { sku: { contains: s } },
      { description: { contains: s } },
    ];
  }

  // Fetch all products matching search to handle status filtering in memory
  // (because status depends on threshold logic: product.lowStockThreshold ?? defaultThreshold)
  const products = await prisma.product.findMany({
    where,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: { stockAdjustments: true },
      },
    },
  });

  // Calculate status for each product
  const enrichedProducts = products.map((product) => {
    const { status: stockStatus, label, effectiveThreshold } = getStockStatus(
      product.quantity,
      product.lowStockThreshold,
      defaultThreshold
    );
    const costValue = product.quantity * product.costPrice;
    const sellingValue = product.quantity * product.sellingPrice;

    return {
      ...product,
      stockStatus,
      stockStatusLabel: label,
      effectiveThreshold,
      costValue,
      sellingValue,
    };
  });

  // Apply status filter if specified
  let filtered = enrichedProducts;
  if (status === "IN_STOCK") {
    filtered = enrichedProducts.filter((p) => p.stockStatus === "HEALTHY");
  } else if (status === "LOW_STOCK") {
    filtered = enrichedProducts.filter((p) => p.stockStatus === "LOW_STOCK");
  } else if (status === "OUT_OF_STOCK") {
    filtered = enrichedProducts.filter((p) => p.stockStatus === "OUT_OF_STOCK");
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const validPage = Math.min(Math.max(1, page), totalPages);
  const skip = (validPage - 1) * limit;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    products: paginated,
    pagination: {
      total,
      page: validPage,
      limit,
      totalPages,
    },
  };
}

export async function getProductById(orgId: string, id: string) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      organizationId: orgId, // STRICT TENANT ISOLATION
    },
    include: {
      stockAdjustments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return product;
}

export async function createProduct(orgId: string, input: ProductInput) {
  // Check if SKU exists within this organization
  const existing = await prisma.product.findUnique({
    where: {
      organizationId_sku: {
        organizationId: orgId,
        sku: input.sku,
      },
    },
  });

  if (existing) {
    throw new Error(`SKU "${input.sku}" is already in use in your organization.`);
  }

  const product = await prisma.product.create({
    data: {
      organizationId: orgId,
      name: input.name,
      sku: input.sku,
      description: input.description,
      quantity: input.quantity,
      costPrice: input.costPrice,
      sellingPrice: input.sellingPrice,
      lowStockThreshold: input.lowStockThreshold ?? null,
    },
  });

  // If initial quantity > 0, record an initial stock adjustment
  if (input.quantity > 0) {
    await prisma.stockAdjustment.create({
      data: {
        organizationId: orgId,
        productId: product.id,
        previousQuantity: 0,
        newQuantity: input.quantity,
        adjustmentAmount: input.quantity,
        reason: "Initial stock entry",
      },
    });
  }

  return product;
}

export async function updateProduct(
  orgId: string,
  id: string,
  input: ProductInput
) {
  // Ensure product belongs to organization
  const existing = await prisma.product.findFirst({
    where: {
      id,
      organizationId: orgId,
    },
  });

  if (!existing) {
    throw new Error("Product not found or access denied.");
  }

  // Check if new SKU clashes with another product in this org
  if (input.sku !== existing.sku) {
    const skuClash = await prisma.product.findUnique({
      where: {
        organizationId_sku: {
          organizationId: orgId,
          sku: input.sku,
        },
      },
    });

    if (skuClash && skuClash.id !== id) {
      throw new Error(`SKU "${input.sku}" is already in use by another product.`);
    }
  }

  // If quantity changed directly in edit form, record a stock adjustment
  const quantityChanged = input.quantity !== existing.quantity;
  const adjustmentAmount = input.quantity - existing.quantity;

  const updatedProduct = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id },
      data: {
        name: input.name,
        sku: input.sku,
        description: input.description,
        quantity: input.quantity,
        costPrice: input.costPrice,
        sellingPrice: input.sellingPrice,
        lowStockThreshold: input.lowStockThreshold ?? null,
      },
    });

    if (quantityChanged) {
      await tx.stockAdjustment.create({
        data: {
          organizationId: orgId,
          productId: id,
          previousQuantity: existing.quantity,
          newQuantity: input.quantity,
          adjustmentAmount,
          reason: "Product details edit",
        },
      });
    }

    return updated;
  });

  return updatedProduct;
}

export async function deleteProduct(orgId: string, id: string) {
  // Verify tenant ownership
  const existing = await prisma.product.findFirst({
    where: {
      id,
      organizationId: orgId,
    },
  });

  if (!existing) {
    throw new Error("Product not found or access denied.");
  }

  return prisma.product.delete({
    where: { id },
  });
}
