import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { products } from "@/data/products";
import { motion } from "framer-motion";
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({ meta: [{ title: "Admin Dashboard — Shopee Mania" }] }),
});

const revenueData = [
  { m: "Jan", r: 245000 }, { m: "Feb", r: 312000 }, { m: "Mar", r: 289000 },
  { m: "Apr", r: 401000 }, { m: "May", r: 478000 }, { m: "Jun", r: 562000 },
];
const categoryData = [
  { c: "Men", s: 420 }, { c: "Women", s: 685 }, { c: "Footwear", s: 312 }, { c: "Accessories", s: 198 },
];

function Admin() {
  const stats = [
    { i: TrendingUp, l: "Revenue", v: "₹56,28,400", d: "+18.2%" },
    { i: ShoppingBag, l: "Orders", v: "2,847", d: "+12.4%" },
    { i: Users, l: "Customers", v: "18,392", d: "+8.7%" },
    { i: Package, l: "Products", v: products.length.toString(), d: "+5 new" },
  ];
  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] gold-text font-bold mb-1">Admin</p>
            <h1 className="font-display text-5xl font-bold">Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground hidden md:block">Last updated: just now</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-2xl p-5">
              <s.i className="w-6 h-6 gold-text mb-3" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{s.l}</p>
              <p className="font-display text-3xl font-bold mt-1">{s.v}</p>
              <p className="text-xs text-green-600 mt-1 font-bold">{s.d}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4">Revenue (6 months)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="r" stroke="var(--gold)" strokeWidth={3} dot={{ fill: "var(--gold)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="c" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="s" fill="var(--gold)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4">Recent Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr><th className="py-3">Product</th><th>Category</th><th>Brand</th><th>Price</th><th>Rating</th><th>Stock</th></tr>
              </thead>
              <tbody>
                {products.slice(0, 8).map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="py-3 flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </td>
                    <td>{p.category}</td>
                    <td>{p.brand}</td>
                    <td>₹{p.price.toLocaleString("en-IN")}</td>
                    <td>{p.rating.toFixed(1)} ★</td>
                    <td><span className="px-2 py-1 bg-green-500/10 text-green-700 rounded-full text-xs font-bold">In Stock</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
