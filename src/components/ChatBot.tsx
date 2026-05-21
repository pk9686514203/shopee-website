import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { products } from "@/data/products";

type Msg = { role: "bot" | "user"; text: string; suggestions?: { id: string; name: string; image: string; price: number }[] };

const greetings: Msg[] = [
  {
    role: "bot",
    text: "Hi! I'm Mania ✨ your personal AI stylist. Ask me about sarees, kurtas, sneakers, watches — or try 'wedding outfit for women'.",
  },
];

const quickReplies = [
  "Wedding outfit for women",
  "Men's casual look",
  "Trending sarees",
  "Shoes under ₹5000",
  "Track my order",
];

function findProducts(query: string) {
  const q = query.toLowerCase();
  const keywords = q.split(/\s+/).filter(Boolean);
  const scored = products
    .map((p) => {
      const hay = `${p.name} ${p.brand} ${p.category} ${p.subCategory} ${p.tags.join(" ")} ${p.occasion.join(" ")}`.toLowerCase();
      const score = keywords.reduce((s, k) => s + (hay.includes(k) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => ({ id: x.p.id, name: x.p.name, image: x.p.images[0], price: x.p.price }));
  return scored;
}

function reply(input: string): Msg {
  const q = input.toLowerCase().trim();
  if (/^(hi|hello|hey|namaste)/i.test(q)) {
    return { role: "bot", text: "Hello! 👋 Looking for something special today? Try 'silk sarees', 'sherwani' or 'men's watches'." };
  }
  if (/track|order|delivery|shipping/.test(q)) {
    return { role: "bot", text: "Orders ship within 24 hours. Login → My Orders to track. Free shipping on orders above ₹999 🚚" };
  }
  if (/return|refund|exchange/.test(q)) {
    return { role: "bot", text: "30-day easy returns on all items. Initiate from your Orders page — pickup is free." };
  }
  if (/discount|coupon|offer|sale|code/.test(q)) {
    return { role: "bot", text: "Use code MANIA20 for 20% off your first order. Sale items already at up to 60% off ✨" };
  }
  if (/stylist|outfit|combo|recommend/.test(q)) {
    return {
      role: "bot",
      text: "I'd love to style you! Open the AI Stylist — pick one hero piece and I'll build the full outfit with matching accessories.",
    };
  }
  const matches = findProducts(q);
  if (matches.length) {
    return {
      role: "bot",
      text: `Found ${matches.length} piece${matches.length > 1 ? "s" : ""} you'll love:`,
      suggestions: matches,
    };
  }
  return {
    role: "bot",
    text: "I can help with products, sizing, returns, offers and styling. Try a category like 'lehenga' or 'men kurta'.",
  };
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(greetings);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setTimeout(() => setMessages((m) => [...m, reply(t)]), 450);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full gold-gradient text-foreground shadow-2xl flex items-center justify-center"
        style={{ boxShadow: "0 12px 40px -8px rgba(212,175,55,0.55)" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="fixed bottom-24 right-4 sm:right-5 z-[60] w-[calc(100vw-2rem)] sm:w-[380px] max-h-[78vh] bg-card text-foreground border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-foreground text-background px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-foreground">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-display text-lg font-bold leading-none">Mania <span className="gold-text">AI</span></p>
                <p className="text-[10px] tracking-[0.25em] uppercase text-background/60 mt-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle" />
                  Online · Replies instantly
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/40">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] ${m.role === "user" ? "bg-foreground text-background" : "bg-background border border-border"} rounded-2xl px-4 py-2.5 text-sm leading-relaxed`}>
                    <p>{m.text}</p>
                    {m.suggestions && (
                      <div className="mt-3 space-y-2">
                        {m.suggestions.map((s) => (
                          <Link
                            key={s.id}
                            to="/product/$id"
                            params={{ id: s.id }}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-xl bg-muted hover:bg-accent/10 transition"
                          >
                            <img src={s.image} alt={s.name} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate">{s.name}</p>
                              <p className="text-[11px] gold-text font-bold">₹{s.price.toLocaleString("en-IN")}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-background border border-border hover:border-accent hover:text-accent transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-border p-3 flex gap-2 bg-background"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sarees, sneakers, orders…"
                className="flex-1 px-4 py-2.5 rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full gold-gradient text-foreground flex items-center justify-center hover:scale-105 transition"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
