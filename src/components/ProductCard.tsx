import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/data/products";
import { useShop } from "@/store/shop";
import { toast } from "sonner";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const wishlist = useShop((s) => s.wishlist);
  const toggle = useShop((s) => s.toggleWishlist);
  const add = useShop((s) => s.addToCart);
  const liked = wishlist.includes(product.id);
  const off = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className="group"
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative overflow-hidden rounded-xl bg-muted aspect-square shadow-sm hover:shadow-lg transition-shadow">
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.5 }}
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-background rounded">New</span>}
            {off > 30 && <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider gold-gradient text-foreground rounded">{off}% Off</span>}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); toggle(product.id); toast.success(liked ? "Removed from wishlist" : "Added to wishlist"); }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background transition"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-accent text-accent" : ""}`} />
          </button>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              onClick={(e) => { e.preventDefault(); add(product); toast.success(`${product.name} added to cart`); }}
              className="w-full py-1.5 bg-foreground text-background rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-accent hover:text-accent-foreground transition"
            >
              <ShoppingBag className="w-3 h-3" /> Quick Add
            </button>
          </motion.div>
        </div>
        <div className="pt-2 space-y-0.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate">{product.brand}</p>
          <h3 className="text-[13px] font-medium line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2 text-[11px]">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({product.reviews})</span>
          </div>
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-[14px] font-bold">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="text-[11px] text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

