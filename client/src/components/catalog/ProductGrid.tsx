import ProductCard, { Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">

          <div className="text-7xl">📦</div>

          <h2 className="mt-6 text-3xl font-bold text-white">
            No Products Found
          </h2>

          <p className="mt-3 text-gray-400">
            Add your first product from the Admin Dashboard.
          </p>

        </div>
      </div>
    );
  }

  return (
    <section className="py-6">

      <div className="mb-10 flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-bold text-white">
            Featured Products
          </h2>

          <p className="mt-2 text-gray-400">
            Showing {products.length} available products
          </p>
        </div>

      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-8
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

    </section>
  );
}