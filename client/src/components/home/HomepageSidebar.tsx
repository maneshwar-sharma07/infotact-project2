import type { ReactNode } from "react";

export type PriceRange = "all" | "under-1000" | "1000-5000" | "over-5000";
export type Availability = "all" | "in-stock" | "out-of-stock";

type HomepageSidebarProps = {
  search: string;
  category: string;
  categories: string[];
  priceRange: PriceRange;
  minimumRating: number;
  availability: Availability;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriceRangeChange: (value: PriceRange) => void;
  onMinimumRatingChange: (value: number) => void;
  onAvailabilityChange: (value: Availability) => void;
  onReset: () => void;
};

export default function HomepageSidebar(props: HomepageSidebarProps) {
  const toggleCategory = (value: string) => props.onCategoryChange(props.category === value ? "all" : value);
  return <aside className="h-fit rounded-2xl border border-gray-800 bg-[#111118] p-5 lg:sticky lg:top-24">
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Filters</h2><button type="button" onClick={props.onReset} className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-200">Reset</button></div>
    <label className="mt-5 block text-sm font-medium text-gray-300">Search<input value={props.search} onChange={(event) => props.onSearchChange(event.target.value)} type="search" placeholder="Search products" className="mt-2 w-full rounded-xl border border-gray-700 bg-[#0A0A0F] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-cyan-400" /></label>
    <FilterGroup title="Categories">{props.categories.map((item) => <FilterButton key={item} active={props.category === item} onClick={() => toggleCategory(item)}>{item}</FilterButton>)}</FilterGroup>
    <FilterGroup title="Price"><FilterButton active={props.priceRange === "under-1000"} onClick={() => props.onPriceRangeChange("under-1000")}>Under ₹1,000</FilterButton><FilterButton active={props.priceRange === "1000-5000"} onClick={() => props.onPriceRangeChange("1000-5000")}>₹1,000 – ₹5,000</FilterButton><FilterButton active={props.priceRange === "over-5000"} onClick={() => props.onPriceRangeChange("over-5000")}>Over ₹5,000</FilterButton></FilterGroup>
    <FilterGroup title="Rating"><FilterButton active={props.minimumRating === 5} onClick={() => props.onMinimumRatingChange(5)}>★★★★★</FilterButton><FilterButton active={props.minimumRating === 4} onClick={() => props.onMinimumRatingChange(4)}>★★★★☆ & up</FilterButton><FilterButton active={props.minimumRating === 3} onClick={() => props.onMinimumRatingChange(3)}>★★★☆☆ & up</FilterButton></FilterGroup>
    <FilterGroup title="Availability"><FilterButton active={props.availability === "in-stock"} onClick={() => props.onAvailabilityChange("in-stock")}>In Stock</FilterButton><FilterButton active={props.availability === "out-of-stock"} onClick={() => props.onAvailabilityChange("out-of-stock")}>Out of Stock</FilterButton></FilterGroup>
    <button type="button" onClick={props.onReset} className="mt-5 w-full rounded-xl border border-purple-400/60 px-4 py-2.5 text-sm font-semibold text-purple-300 transition hover:bg-purple-500 hover:text-white">Reset Filters</button>
  </aside>;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) { return <div className="mt-4 border-t border-gray-800 pt-3"><h3 className="text-sm font-semibold">{title}</h3><div className="mt-1 space-y-0.5">{children}</div></div>; }
function FilterButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) { return <button type="button" onClick={onClick} className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${active ? "bg-purple-500/20 text-purple-200" : "text-gray-400 hover:bg-white/5 hover:text-cyan-300"}`}>{children}</button>; }
