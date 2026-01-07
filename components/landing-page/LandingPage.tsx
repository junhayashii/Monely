import React from "react";
import Image from "next/image";
import Link from "next/link";
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

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  isDarkMode: boolean;
}

/* -------------------- Sub Components -------------------- */

const Feature: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
}> = ({ icon, title, desc }) => (
  <div className="space-y-6 transition-all duration-500 hover:-translate-y-1">
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
  reversed?: boolean;
}> = ({ tag, title, desc, icon, visual, reversed }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
    <div className={`space-y-8 ${reversed ? "lg:order-2" : ""}`}>
      <div className="flex items-center gap-4">
        <div className="p-4 glass-card rounded-2xl shadow-xl">{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">
          {tag}
        </span>
      </div>

      <h3 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
        {desc}
      </p>

      <button className="flex items-center gap-2 text-sm font-bold text-sky-500 hover:gap-3 transition-all">
        Explore more <ArrowRight className="w-4 h-4" />
      </button>
    </div>

    <div className={`${reversed ? "lg:order-1" : ""}`}>{visual}</div>
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
    className={`relative glass-card p-10 rounded-[3rem] border transition-all duration-300 hover:-translate-y-2 flex flex-col ${
      featured
        ? "border-sky-500 ring-1 ring-sky-500 shadow-xl"
        : "border-white/50 dark:border-slate-800"
    }`}
  >
    {featured && (
      <div className="absolute top-0 right-10 -translate-y-1/2 bg-sky-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
        Most Popular
      </div>
    )}

    <div className="space-y-6 mb-10">
      <div>
        <h4 className="text-lg font-bold">{tier}</h4>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-xs uppercase tracking-widest text-slate-400">
          / Month
        </span>
      </div>
    </div>

    <div className="space-y-4 mb-10 flex-1">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <div
            className={`p-1 rounded-full ${
              featured
                ? "bg-sky-100 text-sky-500"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <Check className="w-3 h-3" />
          </div>
          <span>{f}</span>
        </div>
      ))}
    </div>

    <button
      onClick={onCta}
      className={`w-full py-4 rounded-2xl font-bold text-sm transition-colors ${
        featured
          ? "bg-sky-500 text-white hover:bg-sky-600"
          : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
      }`}
    >
      {cta}
    </button>
  </div>
);

/* -------------------- Page -------------------- */

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
}) => {
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[60%] h-[60%] bg-sky-400/10 blur-[120px] rounded-full animate-float-slow" />
        <div className="absolute top-1/3 -right-40 w-[50%] h-[50%] bg-indigo-400/10 blur-[120px] rounded-full animate-float-slower" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/30 dark:bg-slate-950/30 border-b">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src={logo} width={32} height={32} alt="Logo" />
            <span className="text-xl font-bold">Monely</span>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-bold text-slate-500">
            <a href="#features" className="hover:text-sky-500">
              Features
            </a>
            <a href="#pricing" className="hover:text-sky-500">
              Pricing
            </a>
          </div>

          <div className="flex gap-4">
            <Link href="/login">
              <button
                onClick={onLogin}
                className="text-sm font-bold text-slate-500 hover:text-sky-500"
              >
                Login
              </button>
            </Link>
            <Link href="/login">
              <button
                onClick={onGetStarted}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-bold hover:scale-105 transition"
              >
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-40 pb-32 grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-xs font-bold uppercase tracking-widest text-sky-600">
            <Sparkles className="w-3 h-3" /> Redefining Personal Finance
          </span>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
            Pure Wealth <br />
            <span className="bg-linear-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent italic">
              Simplified.
            </span>
          </h1>

          <p className="text-lg text-slate-500 max-w-lg">
            Minimalist design meets powerful financial intelligence.
          </p>

          <Link href="/login">
            <button
              onClick={onGetStarted}
              className="px-10 py-5 bg-sky-500 text-white rounded-3xl font-bold shadow-xl hover:bg-sky-600 hover:scale-105 transition"
            >
              Start Your Journey <ArrowRight className="inline w-5 h-5 ml-2" />
            </button>
          </Link>
        </div>

        {/* Visual */}
        <div className="hidden lg:block glass-card rounded-[4rem] p-12">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center text-white">
                  <PieChart />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Net Worth
                  </p>
                  <p className="text-3xl font-bold">¥3,540,200</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full">
                +12.4%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-8 py-40 space-y-32"
      >
        <FeatureBlock
          tag="Insight"
          title="Intelligence that speaks wealth."
          desc="AI-driven insights tailored to your lifestyle."
          icon={<Zap className="w-8 h-8 text-amber-500" />}
          visual={
            <div className="glass-card h-64 rounded-3xl flex items-center justify-center text-3xl font-bold">
              AI Active
            </div>
          }
        />

        <FeatureBlock
          tag="Visual"
          title="See your money."
          desc="Beautiful charts and real-time clarity."
          icon={<PieChart className="w-8 h-8 text-sky-500" />}
          visual={
            <div className="glass-card h-64 rounded-3xl flex items-center justify-center text-3xl font-bold">
              Graphs
            </div>
          }
          reversed
        />
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-8 py-40">
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard
            tier="Free"
            price="0"
            desc="Perfect to get started"
            features={["Transactions", "Budgets", "Cloud Sync"]}
            cta="Start Free"
            onCta={onGetStarted}
          />
          <PricingCard
            tier="Plus"
            price="300-500"
            desc="Advanced insights"
            features={["Reports", "Charts", "Export"]}
            cta="Coming Soon"
            featured
            onCta={onGetStarted}
          />
          <PricingCard
            tier="Pro"
            price="TBD"
            desc="Invitation only"
            features={["AI Insights", "Family Sharing", "Advanced Analytics"]}
            cta="Request Access"
            onCta={onGetStarted}
          />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
