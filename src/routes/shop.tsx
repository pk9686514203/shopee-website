import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/data/products";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

type Search = { q?: string; category?: string; subCategory?: string; sort?: string; gender?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: s.q as string | undefined,
    category: s.category as string | undefined,
    subCategory: s.subCategory as string | undefined,
    sort: s.sort as string | undefined,
    gender: s.gender as string | undefined,
  }),
  component: Shop,
  head: () => ({ meta: [{ title: "Shop — Shopee Mania" }, { name: "description", content: "Browse our luxury fashion catalog" }] }),
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [maxPrice, setMaxPrice] = useState(50000);
  const [openFilters, setOpenFilters] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)));
    }
    if (search.category) list = list.filter((p) => p.category === search.category);
    if (search.subCategory) list = list.filter((p) => p.subCategory === search.subCategory);
    if (search.gender) list = list.filter((p) => p.gender === search.gender);
    list = list.filter((p) => p.price <= maxPrice);
    if (selectedColors.length) list = list.filter((p) => p.colors.some((c) => selectedColors.includes(c)));
    if (selectedBrands.length) list = list.filter((p) => selectedBrands.includes(p.brand));
    if (search.sort === "new") list = list.filter((p) => p.isNew).concat(list.filter((p) => !p.isNew));
    if (search.sort === "sale") list = list.filter((p) => p.isSale).concat(list.filter((p) => !p.isSale));
    if (search.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (search.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (search.sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [search, maxPrice, selectedColors, selectedBrands]);

  const allBrands = [...new Set(products.map((p) => p.brand))];
  const allColors = [...new Set(products.flatMap((p) => p.colors))];
  const allSubCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (!search.category || p.category === search.category) set.add(p.subCategory);
    });
    return Array.from(set);
  }, [search.category]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="mb-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-6xl font-bold">
            {search.category || search.subCategory || (search.sort === "sale" ? "Sale" : search.sort === "new" ? "New Arrivals" : "All Products")}
          </motion.h1>
          <p className="text-muted-foreground mt-2">{filtered.length} pieces</p>
        </div>

        <div className="flex gap-8">
          <aside className={`${openFilters ? "fixed inset-0 z-50 bg-background p-6 overflow-y-auto" : "hidden"} lg:block lg:static lg:w-64 shrink-0 space-y-8`}>
            <div className="flex justify-between items-center lg:hidden">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setOpenFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterBlock title="Category">
              {categories.map((category) => (
                <button key={category.name} onClick={() => navigate({ to: "/shop", search: { ...search, category: search.category === category.name ? undefined : category.name } })} className={`block text-sm py-1 hover:text-accent ${search.category === category.name ? "text-accent font-bold" : ""}`}>{category.name}</button>
              ))}
            </FilterBlock>
            <FilterBlock title="Subcategory">
              {allSubCategories.length ? (
                allSubCategories.map((s) => (
                  <button key={s} onClick={() => navigate({ to: "/shop", search: { ...search, subCategory: search.subCategory === s ? undefined : s } })} className={`block text-sm py-1 hover:text-accent ${search.subCategory === s ? "text-accent font-bold" : ""}`}>{s}</button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No subcategories</p>
              )}
            </FilterBlock>
            <FilterBlock title="Sort">
              {[{v:"new",l:"Newest"},{v:"price-asc",l:"Price ↑"},{v:"price-desc",l:"Price ↓"},{v:"rating",l:"Top Rated"},{v:"sale",l:"On Sale"}].map((o) => (
                <button key={o.v} onClick={() => navigate({ to: "/shop", search: { ...search, sort: search.sort === o.v ? undefined : o.v } })} className={`block text-sm py-1 hover:text-accent ${search.sort === o.v ? "text-accent font-bold" : ""}`}>{o.l}</button>
              ))}
            </FilterBlock>
            <FilterBlock title={`Max Price ₹${maxPrice.toLocaleString("en-IN")}`}>
              <input type="range" min={1000} max={50000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-[color:var(--gold)]" />
            </FilterBlock>
            <FilterBlock title="Brand">
              <div className="max-h-40 overflow-y-auto space-y-1">
                {allBrands.map((b) => (
                  <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggle(selectedBrands, setSelectedBrands, b)} className="accent-[color:var(--gold)]" />{b}
                  </label>
                ))}
              </div>
            </FilterBlock>
            <FilterBlock title="Color">
              <div className="flex flex-wrap gap-1.5">
                {allColors.map((c) => (
                  <button key={c} onClick={() => toggle(selectedColors, setSelectedColors, c)} className={`px-3 py-1 rounded-full border text-xs ${selectedColors.includes(c) ? "border-accent bg-accent/10" : "border-border"}`}>{c}</button>
                ))}
              </div>
            </FilterBlock>
          </aside>

          <div className="flex-1">
            <button onClick={() => setOpenFilters(true)} className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 border border-border rounded-full text-sm">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-2xl font-display font-bold mb-2">No pieces found</p>
                <p className="text-muted-foreground">Try clearing filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-widest font-bold mb-3">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
