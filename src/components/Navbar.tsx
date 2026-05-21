import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Moon, Sun, Sparkles, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useShop } from "@/store/shop";
import { Logo } from "@/components/Logo";

const navLinks = [
  { label: "Men", to: "/shop", search: { category: "Men" } },
  { label: "Women", to: "/shop", search: { category: "Women" } },
  { label: "Ethnic", to: "/shop", search: { category: "Ethnic" } },
  { label: "Footwear", to: "/shop", search: { category: "Footwear" } },
  { label: "Accessories", to: "/shop", search: { category: "Accessories" } },
  { label: "New", to: "/shop", search: { sort: "new" } },
  { label: "Sale", to: "/shop", search: { sort: "sale" } },
];

export function Navbar() {
  const navigate = useNavigate();
  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);
  const theme = useShop((s) => s.theme);
  const toggleTheme = useShop((s) => s.toggleTheme);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [theme]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/shop", search: { q: q.trim() } });
  };

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);

  return (
    <>
      <div className="bg-foreground text-background py-2 text-center text-xs tracking-widest uppercase">
        Free Shipping Above ₹999 · Use Code <span className="gold-text font-bold">MANIA20</span> For 20% Off
      </div>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 transition-all ${scrolled ? "glass border-b border-border" : "bg-background"}`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-20">
            <Link to="/" className="shrink-0">
              <Logo />
            </Link>

            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((l) => (
                <Link key={l.label} to={l.to} search={l.search as never} className="text-sm font-medium hover:text-accent transition-colors relative group">
                  {l.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 gold-gradient group-hover:w-full transition-all" />
                </Link>
              ))}
              <Link to="/ai-stylist" className="text-sm font-bold flex items-center gap-1.5 gold-text">
                <Sparkles className="w-4 h-4" /> AI Stylist
              </Link>
            </nav>

            <form onSubmit={submit} className="hidden md:flex flex-1 max-w-xs relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search luxury..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </form>

            <div className="flex items-center gap-1">
              <button onClick={toggleTheme} className="p-2.5 hover:bg-muted rounded-full transition" aria-label="Theme">
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/wishlist" className="p-2.5 hover:bg-muted rounded-full transition relative">
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </motion.span>
                )}
              </Link>
              <Link to="/cart" className="p-2.5 hover:bg-muted rounded-full transition relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </motion.span>
                )}
              </Link>
              <Link to="/login" className="hidden md:flex p-2.5 hover:bg-muted rounded-full transition">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={() => setOpen(!open)} className="lg:hidden p-2.5 hover:bg-muted rounded-full">
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                <form onSubmit={submit} className="relative md:hidden">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search luxury..." className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-full text-sm" />
                </form>
                {navLinks.map((l) => (
                  <Link key={l.label} to={l.to} search={l.search as never} onClick={() => setOpen(false)} className="py-2 text-sm font-medium">{l.label}</Link>
                ))}
                <Link to="/ai-stylist" onClick={() => setOpen(false)} className="py-2 text-sm font-bold gold-text flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Stylist
                </Link>
                <Link to="/login" onClick={() => setOpen(false)} className="py-2 text-sm font-medium">Sign In</Link>
                <Link to="/admin" onClick={() => setOpen(false)} className="py-2 text-sm font-medium">Admin</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
