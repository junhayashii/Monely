import React from "react";
import {
  Sparkles,
  PieChart,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  Star,
  Layers,
} from "lucide-react";

import logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  isDarkMode: boolean;
}

const Feature: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
}> = ({ icon, title, desc }) => (
  <div className="space-y-6 transition-all duration-700 ease-out transform translate-y-0 opacity-100">
    <div className="p-4 bg-white/10 dark:bg-slate-100 rounded-2xl w-fit">
      {icon}
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-sm opacity-60 dark:text-slate-500 leading-relaxed font-medium">
      {desc}
    </p>
  </div>
);

const FeatureBlock: React.FC<{
  tag: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
  reversed: boolean;
}> = ({ tag, title, desc, icon, visual, reversed }) => (
  <div
    className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${
      reversed ? "lg:flex-row-reverse" : ""
    }`}
  >
    <div className={`space-y-8 ${reversed ? "lg:order-2" : ""}`}>
      <div className="flex items-center gap-4">
        <div className="p-4 glass-card rounded-2xl shadow-xl">{icon}</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">
          {tag}
        </div>
      </div>
      <h3 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
        {desc}
      </p>
      <button className="flex items-center gap-2 text-sm font-bold text-sky-500 hover:gap-3 transition-all group">
        Explore more <ArrowRight className="w-4 h-4" />
      </button>
    </div>
    <div className={reversed ? "lg:order-1" : ""}>{visual}</div>
  </div>
);

const PricingCard: React.FC<{
  tier: string;
  price: string;
  desc: string;
  features: string[];
  cta: string;
  featured?: boolean;
  onCta: () => void;
}> = ({ tier, price, desc, features, cta, featured, onCta }) => (
  <div
    className={`relative glass-card p-10 rounded-[3rem] border transition-all duration-500 flex flex-col hover:-translate-y-2 ${
      featured
        ? "border-sky-500 shadow-2xl shadow-sky-100 dark:shadow-none ring-1 ring-sky-500"
        : "border-white/50 dark:border-slate-800"
    }`}
  >
    {featured && (
      <div className="absolute top-0 right-10 -translate-y-1/2 bg-sky-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-sky-200 dark:shadow-none">
        Most Popular
      </div>
    )}
    <div className="space-y-6 mb-10">
      <div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
          {tier}
        </h4>
        <p className="text-sm text-slate-500 mt-1">{desc}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold dark:text-white">${price}</span>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          / Month
        </span>
      </div>
    </div>

    <div className="space-y-4 mb-10 flex-1">
      {features.map((f, i) => (
        <div
          key={i}
          className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
        >
          <div
            className={`p-1 rounded-full ${
              featured
                ? "bg-sky-100 text-sky-500"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <Check className="w-3 h-3" />
          </div>
          <span className="font-medium">{f}</span>
        </div>
      ))}
    </div>

    <button
      onClick={onCta}
      className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
        featured
          ? "bg-sky-500 text-white shadow-sky-200 dark:shadow-none hover:bg-sky-600"
          : "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
      }`}
    >
      {cta}
    </button>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
}) => {
  return (
    <div className="relative overflow-hidden min-h-screen selection:bg-sky-100 selection:text-sky-900">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        {/* 背景のアニメーションはグローバルCSSで定義するか、Tailwind標準のanimate-pulseなどで代用 */}
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-sky-400/10 blur-[120px] rounded-full animate-[pulse_10s_infinite]" />
        <div className="absolute top-[20%] -right-[5%] w-[45%] h-[45%] bg-indigo-400/10 blur-[100px] rounded-full animate-[pulse_8s_infinite]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-rose-300/10 blur-[150px] rounded-full opacity-30 animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/30 dark:bg-slate-950/30 border-b border-white/20 dark:border-slate-800/20">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 transition-opacity duration-500">
            <div className="cursor-pointer">
              <div className="hover:rotate-[360deg] transition-transform duration-700">
                <Image
                  src={logo}
                  width={32}
                  height={32}
                  alt="Logo"
                  className="shrink-0"
                />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
              Monely
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            {["Features", "Pricing"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="hover:text-sky-500 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <button
                onClick={onLogin}
                className="text-sm font-bold text-slate-500 hover:text-sky-500 transition-colors hidden sm:block"
              >
                Login
              </button>
            </Link>
            <Link href="/login">
              <button
                onClick={onGetStarted}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-40 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[90vh]">
        <div className="space-y-8 animate-[fadeInUp_1s_ease-out]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/20 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300 border border-sky-100 dark:border-sky-800/30">
            <Sparkles className="w-3 h-3" /> Redefining Personal Finance
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.05] text-slate-900 dark:text-white">
            Pure Wealth <br />
            <span className="bg-linear-to-r from-sky-500 via-indigo-500 to-rose-400 bg-clip-text text-transparent italic">
              Simplified.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
            Experience the harmony of minimalist design and powerful financial
            intelligence. Monely is more than an app; it is your digital vault
            for prosperity.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/login">
              <button
                onClick={onGetStarted}
                className="px-10 py-5 bg-sky-500 text-white rounded-4xl font-bold shadow-2xl shadow-sky-200 dark:shadow-none hover:bg-sky-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
              >
                Start Your Journey{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold"
                >
                  {["JD", "AS", "MK", "LR"][i - 1]}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-[10px] font-bold text-sky-600">
                +2k
              </div>
            </div>
          </div>
        </div>

        {/* Hero Visual Preview */}
        <div className="relative perspective-2000 hidden lg:block animate-[fadeIn_1.2s_ease-out]">
          <div className="glass-card rounded-[4rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative z-10 border-white/50 overflow-hidden group hover:shadow-sky-200 dark:hover:shadow-none transition-all duration-700">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-sky-400 via-indigo-400 to-rose-400" />

            <div className="space-y-10 relative z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-xl shadow-sky-200 dark:shadow-none">
                    <PieChart className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Net Worth Overview
                    </p>
                    <p className="text-3xl font-bold dark:text-white tracking-tight">
                      ¥3,540,200
                    </p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  +12.4%
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>Investment Target</span>
                  <span>78% Met</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: "78%" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-4xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:scale-[1.02] transition-transform">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Growth
                  </p>
                  <p className="text-xl font-bold text-emerald-500 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> ¥820k
                  </p>
                </div>
                <div className="p-6 rounded-4xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:scale-[1.02] transition-transform">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Outflow
                  </p>
                  <p className="text-xl font-bold text-rose-500">¥124k</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Decorators (CSS Animation) */}
          <div className="absolute -top-12 -right-8 glass-card p-6 rounded-3xl shadow-2xl z-20 border-white/60 animate-[bounce_6s_infinite_ease-in-out]">
            <div className="p-2 bg-amber-50 rounded-xl w-fit mb-3">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-xs font-bold dark:text-white">
              Financial Milestone
            </p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
              Achieved Today
            </p>
          </div>

          <div className="absolute -bottom-16 -left-12 glass-card p-6 rounded-3xl shadow-2xl z-20 border-white/60 animate-[pulse_5s_infinite]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Layers className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <p className="text-xs font-bold dark:text-white">
                  Smart Budgets
                </p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                  4 Active
                </p>
              </div>
            </div>
            <div className="w-32 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-sky-500" />
            </div>
          </div>
        </div>
      </section>

      {/* --- Feature Section: Interactive Zig-Zag --- */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-8 py-40 space-y-40 overflow-hidden"
      >
        {/* 1. AI Analysis Active 部分 */}
        <FeatureBlock
          tag="Insight"
          title="Intelligence that speaks wealth."
          desc="Our AI-driven engine analyzes your spending patterns to provide tailored advice."
          icon={<Zap className="w-8 h-8 text-amber-500" />}
          visual={
            <div className="relative group">
              {/* 背景の光るエフェクト */}
              <div className="absolute -inset-4 bg-sky-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />

              <div className="relative glass-card p-12 rounded-[3rem] h-[300px] flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-white/80 to-sky-100/50 dark:from-slate-900/80 dark:to-slate-800/50 border-white/50 shadow-2xl transition-transform duration-700 hover:scale-[1.02]">
                {/* AIスキャン風のライン */}
                <div className="absolute top-0 left-0 w-full h-1 bg-sky-400/30 blur-sm animate-[bounce_4s_infinite]" />

                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-sky-400/30 rounded-full animate-ping" />
                    <Zap className="w-16 h-16 text-sky-500 relative z-10" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold bg-linear-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                      AI Analysis Active
                    </p>
                    <div className="mt-2 flex gap-1 justify-center">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:${
                            i * 0.2
                          }s]`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          reversed={false}
        />

        {/* 2. Real-time Graphs 部分 */}
        <FeatureBlock
          tag="Visual"
          title="See your money, don't just track it."
          desc="Immersive glassmorphism charts and real-time fluid animations."
          icon={<PieChart className="w-8 h-8 text-sky-500" />}
          visual={
            <div className="relative group">
              <div className="relative glass-card p-12 rounded-[3rem] h-[300px] flex flex-col justify-between overflow-hidden bg-linear-to-br from-white/80 to-indigo-100/50 dark:from-slate-900/80 dark:to-slate-800/50 border-white/50 shadow-2xl transition-all duration-700 hover:rotate-1">
                <p className="text-xl font-bold text-slate-800 dark:text-white">
                  Real-time Graphs
                </p>

                {/* グラフを模したバーのスタック */}
                <div className="space-y-4">
                  {[
                    { label: "Spending", width: "60%", color: "bg-rose-400" },
                    { label: "Savings", width: "85%", color: "bg-emerald-400" },
                    { label: "Investment", width: "45%", color: "bg-sky-400" },
                  ].map((bar, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>{bar.label}</span>
                        <span>{bar.width}</span>
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${bar.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: bar.width }} // 初期表示から伸びる
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 右上の小さなフロート要素 */}
                <div className="absolute top-8 right-8 p-3 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl border border-white/20 animate-float">
                  <PieChart className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            </div>
          }
          reversed={true}
        />
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-8 py-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[4rem] mb-40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10">
          <Sparkles className="w-96 h-96 animate-pulse" />
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-16 p-12">
          <Feature
            icon={<ShieldCheck className="w-6 h-6 text-sky-400" />}
            title="Private & Secure"
            desc="Bank-grade encryption that stays on your device. Your privacy is our paramount luxury."
          />
          <Feature
            icon={<Zap className="w-6 h-6 text-amber-400" />}
            title="Zero Friction"
            desc="Automated bank sync and smart category detection for an effortless logging experience."
          />
          <Feature
            icon={<Target className="w-6 h-6 text-rose-400" />}
            title="Precision Goals"
            desc="Set granular targets for everything from your next coffee to your next mansion."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-8 py-40">
        <div className="text-center space-y-4 mb-20">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-500">
            Simple Pricing
          </div>
          <h2 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Choose your plan
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Flexible plans designed for every level of financial management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            tier="Free"
            price="0"
            desc="More than enough features to get started."
            features={[
              "Add & edit transactions",
              "Monthly income/expense view",
              "Basic category management",
              "Secure cloud storage",
              "Access from mobile & desktop",
            ]}
            cta="Start Free"
            onCta={onGetStarted}
          />
          <PricingCard
            tier="Plus"
            price="300-500"
            desc="Visualize your cash flow with powerful insights."
            features={[
              "Monthly & annual reports",
              "Category breakdown charts",
              "Month/year-over-year comparison",
              "Budget alerts & tracking",
              "CSV / PDF export",
              "AI analysis of your spendings",
            ]}
            cta="Coming Soon"
            featured={true}
            onCta={onGetStarted}
          />
          <PricingCard
            tier="Pro (Invitation Only)"
            price="TBD"
            desc="For serious household finance management."
            features={[
              "Long-term trend analysis",
              "AI-powered spending insights",
              "Family & partner sharing",
              "Advanced data analytics",
              "Full customization",
            ]}
            cta="Request Invitation"
            onCta={onGetStarted}
          />
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-8 py-40">
        <div className="relative glass-card p-16 rounded-[4rem] text-center space-y-8 overflow-hidden transition-transform duration-500 hover:scale-[1.01]">
          <div className="absolute inset-0 bg-sky-500/5 -z-10" />
          <div className="absolute top-0 left-0 w-24 h-24 bg-sky-400/20 blur-3xl rounded-full" />

          <h2 className="text-5xl font-bold text-slate-900 dark:text-white leading-tight">
            Ready to elevate your <br /> financial lifestyle?
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-xl mx-auto">
            Join thousands of users who have transformed their household
            accounts into a source of peace and prosperity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link href="/login">
              <button
                onClick={onGetStarted}
                className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-4xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
              >
                Get Started for Free
              </button>
            </Link>

            <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-500 transition-colors">
              Talk to an Advisor <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer (same structure) */}
      <footer className="max-w-7xl mx-auto px-8 pt-20 pb-12 border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20 text-sm">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Image
                src={logo}
                width={32}
                height={32}
                alt="Logo"
                className="shrink-0"
              />
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Monely
              </span>
            </div>
            <p className="text-slate-500 max-w-xs leading-relaxed">
              The ultimate minimalist companion for managing household wealth
              with elegance and precision.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">
              Product
            </p>
            <ul className="space-y-2 text-slate-500">
              <li className="hover:text-sky-500 cursor-pointer">Features</li>
              <li className="hover:text-sky-500 cursor-pointer">Security</li>
              <li className="hover:text-sky-500 cursor-pointer">Pricing</li>
              <li className="hover:text-sky-500 cursor-pointer">Releases</li>
            </ul>
          </div>
          <div className="space-y-4">
            <p className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">
              Company
            </p>
            <ul className="space-y-2 text-slate-500">
              <li className="hover:text-sky-500 cursor-pointer">About</li>
              <li className="hover:text-sky-500 cursor-pointer">Blog</li>
              <li className="hover:text-sky-500 cursor-pointer">Contact</li>
              <li className="hover:text-sky-500 cursor-pointer">Careers</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-slate-50 dark:border-slate-900 gap-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            © 2026 Monely Finance. Premium Quality.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="hover:text-sky-500 cursor-pointer">Terms</span>
            <span className="hover:text-sky-500 cursor-pointer">Privacy</span>
            <span className="hover:text-sky-500 cursor-pointer">Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
