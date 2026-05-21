import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4 text-background">
              <Logo />
            </Link>
            <p className="text-sm text-background/70 max-w-sm leading-relaxed">
              Premium fashion crafted for those who define their own story. AI-powered styling, hand-picked luxury — from sarees and sherwanis to streetwear.
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center hover:border-accent hover:text-accent transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Shop", links: ["Men", "Women", "Ethnic", "Footwear", "Sale"] },
            { title: "Help", links: ["Contact", "Shipping", "Returns", "Size Guide", "FAQ"] },
            { title: "Company", links: ["About", "Careers", "Press", "Sustainability", "Privacy"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold mb-4 text-sm tracking-widest uppercase gold-text">{col.title}</h4>
              <ul className="space-y-2.5 text-sm text-background/70">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="hover:text-accent transition">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-background/10 mt-12 pt-6 flex flex-col md:flex-row gap-3 justify-between items-center text-xs text-background/60">
          <span>© 2026 Shopee Mania. All rights reserved.</span>
          <span className="tracking-[0.25em] uppercase">
            Designed by <span className="gold-text font-bold">Pradeep</span> © 2026
          </span>
          <span>Premium fashion · AI-powered style · Delivered worldwide</span>
        </div>
      </div>
    </footer>
  );
}
