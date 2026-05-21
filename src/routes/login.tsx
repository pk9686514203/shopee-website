import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Sign In — Shopee Mania" }] }),
});

function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      navigate({ to: "/cart" });
    } catch (error: any) {
      const errorMessage = error?.code === "auth/user-not-found" 
        ? "User not found. Please register first."
        : error?.code === "auth/wrong-password"
        ? "Invalid password."
        : error?.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Welcome back!");
      navigate({ to: "/cart" });
    } catch (error: any) {
      toast.error(error?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-200px)]">
        <div className="relative hidden lg:block">
          <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gold-gradient rounded-lg flex items-center justify-center"><Sparkles className="w-5 h-5 text-foreground" /></div>
              <span className="font-display text-2xl font-bold">Shopee<span className="gold-text">Mania</span></span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight max-w-md">"Style is a way to say who you are without having to speak."</h2>
            <p className="mt-3 text-white/70">Premium fashion. AI-powered style. Delivered.</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 lg:p-16">
          <motion.form initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleEmailLogin} className="w-full max-w-md space-y-5">
            <div>
              <h1 className="font-display text-4xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground mt-2">Sign in to access your personalized fashion experience.</p>
            </div>
            <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full py-3 border border-border rounded-full font-medium text-sm flex items-center justify-center gap-3 hover:bg-muted transition disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>}
              Continue with Google
            </button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground"><div className="flex-1 h-px bg-border" />OR<div className="flex-1 h-px bg-border" /></div>
            <div>
              <label className="text-sm font-bold">Email</label>
              <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full px-4 py-3 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="text-sm font-bold">Password</label>
              <div className="relative mt-2">
                <input type={show ? "text" : "password"} required placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 pr-12 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-foreground text-background rounded-full font-bold text-sm uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50 flex items-center justify-center gap-2">{loading && <Loader2 className="w-4 h-4 animate-spin" />} Sign In →</button>
            <p className="text-center text-sm text-muted-foreground">Don't have an account? <Link to="/register" className="font-bold text-foreground hover:gold-text">Register</Link></p>
            <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">Continue Shopping Without Account</Link>
          </motion.form>
        </div>
      </div>
    </Layout>
  );
}

