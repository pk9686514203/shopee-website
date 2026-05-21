import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { products, getRelatedProducts, getOutfitForItem, type Product } from "@/data/products";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Truck, Shield, RotateCcw, Sparkles, Check } from "lucide-react";
import { useShop } from "@/store/shop";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const p = products.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return p;
  },
  component: ProductPage,
  notFoundComponent: () => <Layout><div className="container mx-auto px-4 py-32 text-center"><h1 className="font-display text-5xl">Product not found</h1></div></Layout>,
  errorComponent: ({ error }) => <Layout><div className="container mx-auto px-4 py-32 text-center"><p>{error.message}</p></div></Layout>,
});

function ProductPage() {
  const p = Route.useLoaderData() as Product;
  const [img, setImg] = useState(0);
  const [size, setSize] = useState(p.sizes[0]);
  const [color, setColor] = useState(p.colors[0]);
  const [qty, setQty] = useState(1);
  const add = useShop((s) => s.addToCart);
  const wishlist = useShop((s) => s.wishlist);
  const toggle = useShop((s) => s.toggleWishlist);
  const liked = wishlist.includes(p.id);
  const off = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  const related = getRelatedProducts(p);
  const outfit = getOutfitForItem(p);

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-1 flex flex-col gap-2">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setImg(i)} className={`aspect-square rounded-lg overflow-hidden border-2 ${img === i ? "border-accent" : "border-transparent"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <motion.div key={img} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-4 aspect-[3/4] rounded-2xl overflow-hidden bg-muted group relative">
              <img src={p.images[img]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-150 cursor-zoom-in" />
            </motion.div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] gold-text font-bold mb-2">{p.brand}</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">{p.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 bg-foreground text-background px-2 py-1 rounded text-xs font-bold">
                  {p.rating.toFixed(1)} <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-sm text-muted-foreground">{p.reviews} reviews</span>
              </div>
            </div>
            <div className="flex items-baseline gap-3 pb-6 border-b border-border">
              <span className="font-display text-4xl font-bold">₹{p.price.toLocaleString("en-IN")}</span>
              <span className="text-muted-foreground line-through">₹{p.originalPrice.toLocaleString("en-IN")}</span>
              {off > 0 && <span className="text-sm font-bold text-green-600">({off}% OFF)</span>}
            </div>
            <div>
              <p className="text-sm font-bold mb-3 uppercase tracking-wider">Color: <span className="font-normal capitalize text-muted-foreground">{color}</span></p>
              <div className="flex gap-2">
                {p.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={`px-4 py-2 rounded-full border text-sm transition ${color === c ? "border-accent bg-accent/10 font-bold" : "border-border"}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold mb-3 uppercase tracking-wider">Size: <span className="font-normal text-muted-foreground">{size}</span></p>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`min-w-12 px-4 py-3 rounded-lg border text-sm transition ${size === s ? "border-accent bg-foreground text-background font-bold" : "border-border"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-12 hover:bg-muted rounded-l-full">−</button>
                <span className="w-10 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-12 hover:bg-muted rounded-r-full">+</button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { add(p, size, color, qty); toast.success("Added to cart"); }} className="flex-1 py-4 bg-foreground text-background rounded-full font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition">
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={() => { toggle(p.id); toast.success(liked ? "Removed" : "Wishlisted"); }} className={`w-14 h-14 border border-border rounded-full flex items-center justify-center hover:border-accent transition ${liked ? "bg-accent/10" : ""}`}>
                <Heart className={`w-5 h-5 ${liked ? "fill-accent text-accent" : ""}`} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border">
              {[{i:Truck,t:"Free Shipping"},{i:RotateCcw,t:"30-Day Returns"},{i:Shield,t:"Authentic"}].map((x) => (
                <div key={x.t} className="text-center"><x.i className="w-5 h-5 mx-auto mb-1 gold-text" /><p className="text-xs">{x.t}</p></div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
          </div>
        </div>

        {outfit.length > 0 && (
          <section className="mt-24">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 gold-text" />
              <p className="text-xs uppercase tracking-[0.3em] gold-text font-bold">AI Recommended</p>
            </div>
            <h2 className="font-display text-4xl font-bold mb-8">Complete The Look</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6">
              {outfit.map((o, i) => <ProductCard key={o.id} product={o} index={i} />)}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-between bg-foreground text-background rounded-2xl p-6">
              <div>
                <p className="text-xs uppercase tracking-widest gold-text font-bold mb-1">Bundle Deal</p>
                <p className="font-display text-2xl font-bold">Buy the full combo & save 15%</p>
              </div>
              <button onClick={() => { add(p, size, color); outfit.forEach((o) => add(o)); toast.success("Full combo added!"); }} className="px-8 py-4 gold-gradient text-foreground rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Check className="w-4 h-4" /> Buy Full Combo
              </button>
            </div>
          </section>
        )}

        <section className="mt-24">
          <h2 className="font-display text-4xl font-bold mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6">
            {related.slice(0, 4).map((r, i) => <ProductCard key={r.id} product={r} index={i} />)}
          </div>
        </section>
      </div>
    </Layout>
  );
}
