import ProductCard, { type Product } from "./ProductCard";
interface ProductGridProps { products: Product[]; }
export default function ProductGrid({ products }: ProductGridProps) {
  if (!products.length) return <div className="rounded-2xl border border-dashed border-gray-700 bg-[#111118] px-6 py-20 text-center"><h2 className="text-2xl font-bold text-white">No products found</h2><p className="mt-2 text-gray-400">Try changing your search or filters.</p></div>;
  return <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
