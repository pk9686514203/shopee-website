import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useShop } from "@/store/shop";
import { products } from "@/data/products";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  component: Wishlist,
  head: () => ({ meta: [{ title: "Wishlist — Shopee Mania" }] }),
});

function Wishlist() {
  const ids = useShop((s) => s.wishlist);
  const items = products.filter((p) => ids.includes(p.id));
  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-display text-5xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground mb-8">{items.length} saved pieces</p>
        {items.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
            <p className="font-display text-3xl font-bold mb-2">No favorites yet</p>
            <p className="text-muted-foreground mb-6">Heart pieces you love to save them here.</p>
            <Link to="/shop" className="inline-block px-8 py-4 bg-foreground text-background rounded-full font-bold text-sm uppercase tracking-wider">Explore</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
