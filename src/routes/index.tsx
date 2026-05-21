import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import AIRecommendations from "@/components/AIRecommendations";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Star, Truck, Shield, Award } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { products, categories, heroSlides, reviews } from "@/data/products";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Shopee Mania — Luxury AI Fashion Store" },
      { name: "description", content: "Discover premium fashion with AI-powered styling. Men, Women, Footwear, Accessories — shipped worldwide." },
    ],
  }),
});

function Home() {
  return (
    <Layout>
      <Hero />
      <Marquee />
      <Categories />
      <FeaturedSection />
      <TrendingSection />
      <AIRecommendations />
      <AIStylistBanner />
      <SectionGrid title="New Arrivals" subtitle="Fresh picks for the season" filter={(p) => p.isNew} />
      <SectionGrid title="Sale Picks" subtitle="Hot deals in every category" filter={(p) => p.isSale} />
      <SectionGrid title="Kids Collection" subtitle="Little royalty" filter={(p) => p.category === "Kids"} />
      <SectionGrid title="Ethnic Edit" subtitle="Crafted for celebrations" filter={(p) => p.category === "Ethnic"} />
      <SectionGrid title="Footwear Favorites" subtitle="Step into style" filter={(p) => p.category === "Footwear"} />
      <SectionGrid title="Accessories" subtitle="Finish the look" filter={(p) => p.category === "Accessories"} />
      <Reviews />
      <Newsletter />
    </Layout>
  );
}

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);
  const slide = heroSlides[i];
  return (
    <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>
      <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-2xl text-white">
          <motion.p key={`s-${i}`} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-sm tracking-[0.3em] uppercase mb-4 gold-text font-bold">
            {slide.subtitle}
          </motion.p>
          <motion.h1 key={`t-${i}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.95] mb-8">
            {slide.title}
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex gap-3">
            <Link to={slide.href} className="px-8 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-wider inline-flex items-center gap-2 hover:gap-3 transition-all">
              {slide.cta} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/ai-stylist" className="px-8 py-4 border border-white/40 backdrop-blur text-white rounded-full font-bold text-sm uppercase tracking-wider inline-flex items-center gap-2 hover:bg-white/10 transition">
              <Sparkles className="w-4 h-4" /> AI Stylist
            </Link>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} className={`h-1 rounded-full transition-all ${idx === i ? "w-10 bg-white" : "w-5 bg-white/40"}`} />
        ))}
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    { icon: Truck, text: "Free Worldwide Shipping" },
    { icon: Shield, text: "Authentic Luxury Guaranteed" },
    { icon: Award, text: "AI-Powered Style Match" },
    { icon: Star, text: "10,000+ 5-Star Reviews" },
  ];
  return (
    <div className="border-y border-border py-6 overflow-hidden">
      <div className="flex gap-12 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
        {[...items, ...items, ...items].map((it, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <it.icon className="w-5 h-5 gold-text" />
            <span className="text-sm font-bold tracking-widest uppercase">{it.text}</span>
            <span className="gold-text text-xl">✦</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes scroll { to { transform: translateX(-33.333%); } }`}</style>
    </div>
  );
}

function SectionHeader({ eyebrow, title, link }: { eyebrow: string; title: string; link?: string }) {
  return (
    <div className="flex items-end justify-between mb-10 gap-4">
      <div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold mb-2">{eyebrow}</motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-4xl md:text-6xl font-bold">{title}</motion.h2>
      </div>
      {link && (
        <Link to="/shop" className="text-sm font-bold inline-flex items-center gap-2 hover:gap-3 transition-all border-b-2 border-foreground pb-1">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function Categories() {
  return (
    <section className="container mx-auto px-4 lg:px-8 py-20">
      <SectionHeader eyebrow="Explore" title="Shop by Category" link="/shop" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.slice(0, 4).map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to="/shop" search={{ category: c.name }} className="relative block aspect-[3/4] rounded-2xl overflow-hidden group">
              <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="font-display text-3xl font-bold mb-1">{c.name}</h3>
                <span className="text-xs tracking-widest uppercase opacity-80 group-hover:gold-text transition">Shop Now →</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function TrendingSection() {
  const items = products.filter((p) => p.isTrending).slice(0, 8);
  return (
    <section className="container mx-auto px-4 lg:px-8 py-20">
      <SectionHeader eyebrow="Hot Right Now" title="Trending Pieces" link="/shop" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6">
        {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}

function FeaturedSection() {
  const items = products.filter((p) => p.isFeatured).slice(0, 8);
  if (!items.length) return null;
  return (
    <section className="container mx-auto px-4 lg:px-8 py-20 bg-gradient-to-r from-background via-muted to-background rounded-3xl">
      <SectionHeader eyebrow="Featured" title="Editor’s Picks" link="/shop" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6">
        {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}

function SectionGrid({ title, subtitle, filter }: { title: string; subtitle: string; filter: (p: typeof products[number]) => boolean }) {
  const items = products.filter(filter).slice(0, 8);
  if (!items.length) return null;
  return (
    <section className="container mx-auto px-4 lg:px-8 py-20">
      <SectionHeader eyebrow={subtitle} title={title} link="/shop" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6">
        {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}

function AIStylistBanner() {
  return (
    <section className="relative my-20 overflow-hidden bg-foreground text-background">
      <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 50%, var(--gold) 0%, transparent 50%)" }} />
      <div className="relative container mx-auto px-4 lg:px-8 py-24 text-center">
        <motion.div initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} className="inline-flex w-16 h-16 gold-gradient rounded-2xl items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-foreground" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-5xl md:text-7xl font-bold mb-4">
          AI Stylist <span className="gold-text">Your Perfect Look</span>
        </motion.h2>
        <p className="text-background/70 max-w-xl mx-auto mb-8 text-lg">Pick one piece, get a complete outfit. Our AI matches colors, occasions, and your vibe.</p>
        <Link to="/ai-stylist" className="inline-flex items-center gap-2 px-8 py-4 gold-gradient text-foreground rounded-full font-bold text-sm uppercase tracking-wider hover:gap-3 transition-all">
          Try AI Stylist <Sparkles className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function BrandsStrip() {
  const brands = ["Aurum", "Noir", "Velvet & Co", "Maison Lux", "Studio Mania", "Ivory", "Atelier 21"];
  return (
    <section className="border-y border-border py-12">
      <p className="text-center text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6 font-bold">Curated Luxury Brands</p>
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
        {brands.map((b) => (
          <span key={b} className="font-display text-2xl md:text-3xl font-bold opacity-60 hover:opacity-100 transition">{b}</span>
        ))}
      </div>
    </section>
  );
}


function Reviews() {
  return (
    <section className="container mx-auto px-4 lg:px-8 py-20">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-bold mb-2">Reviews</p>
        <h2 className="font-display text-5xl md:text-6xl font-bold">What Our Customers Say</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {reviews.map((r, i) => (
          <motion.div key={r.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-2xl p-6 hover:luxury-shadow transition">
            <div className="flex gap-0.5 mb-3">
              {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}
            </div>
            <p className="text-sm leading-relaxed mb-4">"{r.text}"</p>
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <div className="w-9 h-9 gold-gradient rounded-full flex items-center justify-center text-foreground font-bold text-sm">{r.name[0]}</div>
              <div>
                <p className="font-bold text-sm">{r.name}</p>
                <p className="text-[10px] text-accent uppercase tracking-wider font-bold">Verified Purchase</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="bg-foreground text-background py-24">
      <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
        <p className="text-xs tracking-[0.3em] uppercase gold-text font-bold mb-3">Exclusive Access</p>
        <h2 className="font-display text-5xl md:text-6xl font-bold mb-4">Stay Ahead of the Trend</h2>
        <p className="text-background/70 mb-8">Subscribe for early access to new collections, exclusive deals, and AI-curated style inspiration.</p>
        <form onSubmit={(e) => { e.preventDefault(); }} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input type="email" placeholder="Enter your email" required className="flex-1 px-5 py-4 bg-background/10 border border-background/20 rounded-full text-sm focus:outline-none focus:border-accent" />
          <button className="px-8 py-4 gold-gradient text-foreground rounded-full text-sm font-bold uppercase tracking-wider">Subscribe</button>
        </form>
      </div>
    </section>
  );
}



