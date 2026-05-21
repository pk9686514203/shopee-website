import { ProductCard } from "./ProductCard";
import { products, getOutfitForItem } from "@/data/products";
import { motion } from "framer-motion";
import { useShop } from "@/store/shop";
import { useMemo, useState } from "react";

function ComboPreviewModal({ open, onClose, item, offset }: { open: boolean; onClose: () => void; item: typeof products[number] | null; offset: number }) {
  const add = useShop((s) => s.addToCart);
  const [seedOffset] = useState(offset || 0);
  const outfit = useMemo(() => (item ? getOutfitForItem({ ...(item as any), id: String(Number(item.id) + seedOffset) }) : []), [item, seedOffset]);
  if (!open || !item) return null;
  const total = (item.price || 0) + outfit.reduce((a, b) => a + b.price, 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-foreground text-background rounded-3xl p-6 w-full max-w-3xl z-10">
        <div className="flex items-start gap-6">
          <img src={item.images[0]} alt={item.name} className="w-32 h-32 object-cover rounded-lg" />
          <div className="flex-1">
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-muted-foreground mb-2">{outfit.length + 1} pieces · ₹{total.toLocaleString("en-IN")}</p>
            <div className="flex gap-2 mb-3">
              {[item, ...outfit.slice(0, 4)].map((p) => (
                <div key={p.id} className="w-20">
                  <img src={p.images[0]} alt={p.name} className="w-full h-20 object-cover rounded-md" />
                  <p className="text-[12px] line-clamp-1">{p.name}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { add(item); outfit.forEach((o) => add(o)); onClose(); }} className="px-4 py-2 gold-gradient text-foreground rounded-full font-bold">Add Combo</button>
              <button onClick={onClose} className="px-4 py-2 border rounded-full">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIRecommendations() {
  const menItems = products.filter((p) => p.gender === "men" && p.isTrending).slice(0, 4);
  const womenItems = products.filter((p) => p.gender === "women" && p.isTrending).slice(0, 4);
  const add = useShop((s) => s.addToCart);

  const Combo = ({ item }: { item: typeof products[number] }) => {
    const outfit = getOutfitForItem(item).slice(0, 3);
    const total = (item.price || 0) + outfit.reduce((a, b) => a + b.price, 0);
    const [open, setOpen] = useState(false);
    const [offset, setOffset] = useState(0);
    return (
      <div className="bg-card border border-border rounded-2xl p-3">
        <div className="flex gap-3 items-center mb-3">
          <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
          <div>
            <p className="text-xs text-muted-foreground">AI Match</p>
            <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
            <p className="text-[12px] text-muted-foreground">{outfit.length + 1} pieces · ₹{total.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <div className="flex -space-x-2">
            {[item, ...outfit].map((p) => (
              <img key={p.id} src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-md border border-border bg-background" />
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => { add(item); outfit.forEach((o) => add(o)); }} className="px-3 py-2 gold-gradient text-foreground rounded-full text-xs font-bold">Buy Combo</button>
            <button onClick={() => setOpen(true)} className="px-3 py-2 border rounded-full text-xs">Preview</button>
            <ComboPreviewModal open={open} onClose={() => setOpen(false)} item={item} offset={offset} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="container mx-auto px-4 lg:px-8 py-16">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-display text-2xl font-bold mb-3">Men — AI Picks</h3>
          <p className="text-muted-foreground mb-4">Selected combos curated for men based on shirts, pants, sneakers and accessories.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menItems.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="">
                <Combo item={m} />
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold mb-3">Women — AI Picks</h3>
          <p className="text-muted-foreground mb-4">Trendy outfit combinations for kurtis, sarees, tops — matched with leggings, blouses and jewelry.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {womenItems.map((w) => (
              <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="">
                <Combo item={w} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIRecommendations;
