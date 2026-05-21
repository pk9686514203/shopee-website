import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({ meta: [{ title: "Register — Shopee Mania" }] }),
});

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
      });

      toast.success("Welcome to Shopee Mania!");
      navigate({ to: "/" });
    } catch (error: any) {
      const errorMessage = error?.code === "auth/email-already-in-use"
        ? "Email already registered. Please login."
        : error?.code === "auth/weak-password"
        ? "Password is too weak."
        : error?.message || "Registration failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <motion.form initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleRegister} className="space-y-5">
          <div className="text-center mb-4">
            <div className="inline-flex w-12 h-12 gold-gradient rounded-xl items-center justify-center mb-3"><Sparkles className="w-6 h-6 text-foreground" /></div>
            <h1 className="font-display text-4xl font-bold">Join Shopee Mania</h1>
            <p className="text-muted-foreground mt-2">Premium fashion. AI-powered style. Free returns.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="px-4 py-3 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            <input placeholder="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="px-4 py-3 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <input type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <input type="password" placeholder="Password (min. 8 chars)" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <button type="submit" disabled={loading} className="w-full py-4 bg-foreground text-background rounded-full font-bold text-sm uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
          <p className="text-center text-sm text-muted-foreground">Have an account? <Link to="/login" className="font-bold text-foreground">Sign in</Link></p>
        </motion.form>
      </div>
    </Layout>
  );
}

