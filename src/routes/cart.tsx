import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useShop } from "@/store/shop";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote, CreditCard, Minus, Plus, Smartphone, Trash2, ShoppingBag, Tag, Wallet, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const Route = createFileRoute("/cart")({
  component: Cart,
  head: () => ({ meta: [{ title: "Cart — Shopee Mania" }] }),
});

function Cart() {
  const navigate = useNavigate();
  const cart = useShop((s) => s.cart);
  const update = useShop((s) => s.updateQty);
  const remove = useShop((s) => s.removeFromCart);
  const clearCart = useShop((s) => s.clearCart);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod" | "debit" | "credit">("upi");
  
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const subtotal = cart.reduce((a, c) => a + c.product.price * c.qty, 0);
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + gst - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "MANIA20") {
      setDiscount(Math.round(subtotal * 0.2));
      toast.success("20% off applied!");
    } else {
      toast.error("Invalid coupon");
    }
  };

  const validateAddress = () => {
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      toast.error("Please fill in all address fields");
      return false;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      toast.error("Phone number must be 10 digits");
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      toast.error("Pincode must be 6 digits");
      return false;
    }
    return true;
  };

  const checkout = async () => {
    if (!user) {
      toast.error("Please login first");
      navigate({ to: "/login" });
      return;
    }

    if (!showAddressForm && !validateAddress()) {
      setShowAddressForm(true);
      return;
    }

    if (!validateAddress()) {
      return;
    }

    setLoading(true);
    try {
      const orderId = `SM-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      
      // Save address
      const addressRef = await addDoc(collection(db, "users", user.uid, "addresses"), {
        ...address,
        isDefault: false,
        createdAt: new Date().toISOString(),
      });

      // Save order
      await addDoc(collection(db, "users", user.uid, "orders"), {
        orderId,
        paymentMethod,
        subtotal,
        shipping,
        gst,
        discount,
        total,
        status: paymentMethod === "cod" ? "Order placed" : "Payment successful",
        trackingStatus: "Order confirmed. Preparing for dispatch.",
        addressId: addressRef.id,
        items: cart.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          image: item.product.images[0],
          price: item.product.price,
          qty: item.qty,
          size: item.size,
          color: item.color,
        })),
        createdAt: new Date().toISOString(),
      });

      // Save cart to Firestore
      await setDoc(doc(db, "users", user.uid, "cart", "current"), {
        items: cart.map((item) => ({
          productId: item.product.id,
          qty: item.qty,
          size: item.size,
          color: item.color,
        })),
        lastUpdated: new Date().toISOString(),
      });

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("last-order", JSON.stringify({
          orderId,
          paymentMethod,
          subtotal,
          shipping,
          gst,
          discount,
          total,
          status: paymentMethod === "cod" ? "Order placed" : "Payment successful",
          trackingStatus: "Order confirmed. Preparing for dispatch.",
          createdAt: new Date().toISOString(),
          items: cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            image: item.product.images[0],
            price: item.product.price,
            qty: item.qty,
            size: item.size,
            color: item.color,
          })),
        }));
      }

      clearCart();
      toast.success(paymentMethod === "cod" ? "Order placed successfully!" : "Payment successful!");
      navigate({ to: "/order-success", search: { orderId } });
    } catch (error: any) {
      toast.error(error?.message || "Checkout failed");
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
          <h1 className="font-display text-5xl font-bold mb-3">Your bag is empty</h1>
          <p className="text-muted-foreground mb-8">Discover pieces that define your style.</p>
          <Link to="/shop" className="inline-block px-8 py-4 bg-foreground text-background rounded-full font-bold text-sm uppercase tracking-wider">Start Shopping</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="font-display text-5xl font-bold mb-8">Shopping Bag</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((c) => (
                <motion.div key={c.product.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex gap-4 p-4 bg-card border border-border rounded-2xl">
                  <Link to="/product/$id" params={{ id: c.product.id }} className="w-28 h-36 shrink-0 rounded-xl overflow-hidden">
                    <img src={c.product.images[0]} alt={c.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{c.product.brand}</p>
                    <Link to="/product/$id" params={{ id: c.product.id }} className="font-bold hover:text-accent">{c.product.name}</Link>
                    <p className="text-xs text-muted-foreground mt-1">Size: {c.size} · Color: {c.color}</p>
                    <div className="flex-1" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-border rounded-full">
                        <button onClick={() => update(c.product.id, c.qty - 1)} className="w-8 h-8 hover:bg-muted rounded-l-full flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm font-bold">{c.qty}</span>
                        <button onClick={() => update(c.product.id, c.qty + 1)} className="w-8 h-8 hover:bg-muted rounded-r-full flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{(c.product.price * c.qty).toLocaleString("en-IN")}</p>
                        <button onClick={() => remove(c.product.id)} className="text-xs text-muted-foreground hover:text-destructive mt-1 flex items-center gap-1 ml-auto"><Trash2 className="w-3 h-3" /> Remove</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <aside className="lg:sticky lg:top-28 self-start space-y-4">
            {showAddressForm && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h3 className="font-display text-2xl font-bold">Delivery Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Full Name" value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} className="col-span-2 px-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  <input type="tel" placeholder="Phone (10 digits)" value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} className="col-span-2 px-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  <input type="text" placeholder="Street Address" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} className="col-span-2 px-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  <input type="text" placeholder="City" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="px-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  <input type="text" placeholder="State" value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} className="px-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                  <input type="tel" placeholder="Pincode (6 digits)" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} className="col-span-2 px-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
              </motion.div>
            )}
            
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-display text-2xl font-bold">Order Summary</h3>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon (MANIA20)" className="w-full pl-10 pr-3 py-2.5 bg-muted rounded-full text-sm focus:outline-none" />
                </div>
                <button onClick={applyCoupon} className="px-4 py-2.5 bg-foreground text-background rounded-full text-xs font-bold uppercase">Apply</button>
              </div>
              <div className="space-y-2 text-sm border-t border-border pt-4">
                <Row l="Subtotal" v={`₹${subtotal.toLocaleString("en-IN")}`} />
                <Row l="Shipping" v={shipping === 0 ? "FREE" : `₹${shipping}`} />
                <Row l="GST (5%)" v={`₹${gst.toLocaleString("en-IN")}`} />
                {discount > 0 && <Row l="Discount" v={`−₹${discount.toLocaleString("en-IN")}`} accent />}
              </div>
              <div className="flex justify-between text-xl font-bold border-t border-border pt-4">
                <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "upi", label: "UPI", icon: Smartphone },
                  { id: "cod", label: "COD", icon: Banknote },
                  { id: "debit", label: "Debit", icon: CreditCard },
                  { id: "credit", label: "Credit", icon: Wallet },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-bold uppercase transition ${
                      paymentMethod === method.id ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent"
                    }`}
                  >
                    <method.icon className="h-4 w-4" />
                    {method.label}
                  </button>
                ))}
              </div>
              {!user ? (
                <button onClick={() => navigate({ to: "/login" })} className="w-full py-4 gold-gradient text-foreground rounded-full font-bold text-sm uppercase tracking-wider">
                  Login to Checkout
                </button>
              ) : (
                <button onClick={checkout} disabled={loading} className="w-full py-4 gold-gradient text-foreground rounded-full font-bold text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

function Row({ l, v, accent }: { l: string; v: string; accent?: boolean }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{l}</span><span className={accent ? "text-green-600 font-bold" : "font-medium"}>{v}</span></div>;
}
