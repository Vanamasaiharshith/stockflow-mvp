import * as React from "react";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/session";
import { getProducts } from "@/lib/services/product.service";
import { ProductManagement } from "@/components/products/product-management";
import { productQuerySchema } from "@/lib/validations/product";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { organization } = await requireAuth();

  const rawParams = await searchParams;

  const parsedQuery = productQuerySchema.safeParse({
    search: typeof rawParams.search === "string" ? rawParams.search : undefined,
    status: typeof rawParams.status === "string" ? rawParams.status : "ALL",
    sortBy: typeof rawParams.sortBy === "string" ? rawParams.sortBy : "updatedAt",
    sortOrder: typeof rawParams.sortOrder === "string" ? rawParams.sortOrder : "desc",
    page: typeof rawParams.page === "string" ? Number(rawParams.page) : 1,
    limit: 15,
  });

  const queryParams = parsedQuery.success
    ? parsedQuery.data
    : {
        search: undefined,
        status: "ALL" as const,
        sortBy: "updatedAt" as const,
        sortOrder: "desc" as const,
        page: 1,
        limit: 15,
      };

  const { products, pagination } = await getProducts(
    organization.id,
    queryParams,
    organization.defaultThreshold
  );

  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-xs text-slate-400">
          Loading catalog...
        </div>
      }
    >
      <ProductManagement
        products={products}
        pagination={pagination}
        organization={{
          defaultThreshold: organization.defaultThreshold,
          currency: organization.currency,
        }}
        currentParams={{
          search: queryParams.search,
          status: queryParams.status,
          sortBy: queryParams.sortBy,
          sortOrder: queryParams.sortOrder,
        }}
      />
    </Suspense>
  );
}
