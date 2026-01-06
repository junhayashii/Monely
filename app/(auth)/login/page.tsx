"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  MailCheck,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Confirmation email sent!");
        setIsSubmitted(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    }

    setLoading(false);
  };

  /* =====================
     Email confirmation
     ===================== */
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-sky-400/10 blur-[120px]" />

        <div className="glass-card w-full max-w-md p-10 rounded-[3rem] text-center relative">
          <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-200">
            <MailCheck className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-sm text-slate-500">
            We’ve sent a confirmation link to
            <br />
            <span className="font-semibold text-slate-900">{email}</span>
          </p>

          <button
            onClick={() => setIsSubmitted(false)}
            className="mt-8 w-full py-4 rounded-[2rem] border font-bold text-sm hover:bg-slate-50 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  /* =====================
     Login / Signup
     ===================== */
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* background flair */}
      <div className="absolute w-[60%] h-[60%] bg-sky-400/10 blur-[150px] rounded-full" />

      <div className="w-full max-w-md">
        <div className="glass-card p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-32 h-32" />
          </div>

          {/* Header */}
          <div className="relative z-10 flex flex-col items-center mb-10">
            <div className="p-3 bg-sky-500 rounded-2xl shadow-lg shadow-sky-200 mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-slate-500 mt-2 text-center">
              {isSignUp
                ? "Join the world of minimalist wealth management."
                : "Sign in to continue to your dashboard."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6 relative z-10">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-[1.5rem] outline-none focus:ring-2 focus:ring-sky-500/30 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 bg-slate-50 border-none rounded-[1.5rem] outline-none focus:ring-2 focus:ring-sky-500/30 text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-sky-500 text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-sky-200 hover:bg-sky-600 transition disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t text-center relative z-10">
            <p className="text-xs text-slate-400 font-medium">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-sky-500 font-bold hover:underline"
              >
                {isSignUp ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
