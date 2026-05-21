import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/order-success")({
  component: OrderSuccess,
  head: () => ({ meta: [{ title: "Order Successful - Shopee Mania" }] }),
});

type SuccessOrder = {
  orderId: string;
  paymentMethod: "upi" | "cod" | "debit" | "credit";
  status: string;
  trackingStatus: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    brand: string;
    image: string;
    price: number;
    qty: number;
    size: string;
    color: string;
  }>;
};

function OrderSuccess() {
  const [order, setOrder] = useState<SuccessOrder | null>(null);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("last-order");
    if (stored) {
      setOrder(JSON.parse(stored));
    }
  }, []);

  const paymentLabel = useMemo(() => {
    if (!order) return "";
    if (order.paymentMethod === "cod") return "Cash on delivery";
    if (order.paymentMethod === "upi") return "UPI payment successful";
    return `${order.paymentMethod === "debit" ? "Debit" : "Credit"} card payment successful`;
  }, [order]);

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-28 text-center">
          <ShoppingBag className="mx-auto mb-5 h-16 w-16 text-muted-foreground" />
          <h1 className="font-display text-4xl font-bold">No recent order found</h1>
          <p className="mt-3 text-muted-foreground">Place an order from your cart to see the success page.</p>
          <Link to="/shop" className="mt-8 inline-flex rounded-full bg-foreground px-8 py-4 text-sm font-bold uppercase tracking-wider text-background">
            Continue Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#07080d] text-white">
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl"
          >
            <div className="relative px-6 py-10 text-center md:px-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.28),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(250,204,21,0.16),transparent_28%)]" />
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 180, damping: 14 }}
                  className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-300 text-black shadow-2xl shadow-emerald-500/30"
                >
                  <CheckCircle2 className="h-14 w-14" />
                </motion.div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-200">{order.status}</p>
                <h1 className="mt-3 text-4xl font-black md:text-6xl">Order Successful</h1>
                <p className="mx-auto mt-4 max-w-xl text-white/62">
                  {paymentLabel}. Your order has been confirmed and can be tracked from the order ID below.
                </p>

                <div className="mx-auto mt-7 flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
                  <span className="text-sm font-black tracking-wider">{order.orderId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(order.orderId);
                      toast.success("Order ID copied");
                    }}
                    className="rounded-xl bg-white/10 p-2 text-white/70 hover:bg-white/20"
                    aria-label="Copy order ID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-5 border-t border-white/10 p-5 lg:grid-cols-[1fr_0.72fr] lg:p-8">
              <div className="rounded-3xl border border-white/10 bg-black/28 p-5">
                <div className="mb-5 flex items-center gap-3">
                  <PackageCheck className="h-5 w-5 text-amber-200" />
                  <h2 className="text-2xl font-black">Order Items</h2>
                </div>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                      <img src={item.image} alt={item.name} className="h-24 w-20 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/38">{item.brand}</p>
                        <p className="truncate font-black">{item.name}</p>
                        <p className="mt-1 text-sm text-white/52">Size {item.size} · {item.color} · Qty {item.qty}</p>
                        <p className="mt-2 font-black">₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-black/28 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <Truck className="h-5 w-5 text-amber-200" />
                    <h2 className="text-2xl font-black">Track Order</h2>
                  </div>
                  <div className="space-y-4">
                    {["Order confirmed", "Preparing for dispatch", "Shipped", "Out for delivery"].map((step, index) => (
                      <div key={step} className="flex gap-3">
                        <span className={`mt-1 h-3 w-3 rounded-full ${index < 2 ? "bg-emerald-300" : "bg-white/18"}`} />
                        <div>
                          <p className="font-bold">{step}</p>
                          {index === 1 && <p className="text-sm text-white/45">{order.trackingStatus}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/28 p-5">
                  <div className="flex justify-between text-sm text-white/52">
                    <span>Payment</span>
                    <span>{paymentLabel}</span>
                  </div>
                  <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-2xl font-black">
                    <span>Total</span>
                    <span>₹{order.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Link to="/shop" className="rounded-full bg-white px-6 py-4 text-center text-sm font-black uppercase tracking-wider text-black hover:bg-amber-200">
                    Continue Shopping
                  </Link>
                  <Link to="/cart" className="rounded-full border border-white/15 px-6 py-4 text-center text-sm font-black uppercase tracking-wider text-white/75 hover:bg-white/10">
                    Back to Cart
                  </Link>
                </div>
              </aside>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
}
