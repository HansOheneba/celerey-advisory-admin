import type { Metadata } from "next";

import { ProductsView } from "@/components/products/products-view";
import { requireSession } from "@/lib/dal";
import { getProducts } from "@/lib/demo/repositories";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  await requireSession();

  return <ProductsView products={getProducts()} />;
}
