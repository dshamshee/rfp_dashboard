"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Typewriter from "typewriter-effect";
import {
  FileSpreadsheet,
  Sparkles,
  Shield,
  Users,
  BarChart3,
  ArrowRight,
  Zap,
  Globe,
  ChevronDown,
  Lock,
} from "lucide-react";

/* ─── Intersection Observer hook for scroll animations ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

/* ─── Feature Card ─── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: string;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 ${
        isInView ? `animate-fade-in-up ${delay}` : "opacity-0"
      }`}
    >
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15">
          <Icon className="size-6" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ─── Stat Item ─── */
function StatItem({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: string;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`text-center ${
        isInView ? `animate-fade-in-up ${delay}` : "opacity-0"
      }`}
    >
      <div className="text-3xl font-bold text-foreground md:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const featuresSection = useInView(0.1);
  const statsSection = useInView(0.1);
  const ctaSection = useInView(0.2);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Extraction",
      description:
        "Upload RFP documents and let Google Gemini AI automatically parse tender metadata — client, dates, values, eligibility, and more.",
    },
    {
      icon: BarChart3,
      title: "Smart Tender Tracking",
      description:
        "Track every tender through its lifecycle: draft, evaluation, EMD, quotation, margin analysis, and award status in one view.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Built-in discussion threads per tender for seamless team collaboration, audit trails, and real-time decision making.",
    },
    {
      icon: Shield,
      title: "Secure & Authenticated",
      description:
        "Enterprise-grade security with Google OAuth, role-based access control, and duplicate document detection via SHA-256 hashing.",
    },
    {
      icon: Zap,
      title: "Instant PDF Processing",
      description:
        "Smart PDF compression and optimization before storage. Upload once — extract data, compress, and store automatically.",
    },
    {
      icon: Globe,
      title: "Cloud-Native Architecture",
      description:
        "Built on Next.js 16 with serverless PostgreSQL, Cloudinary storage, and TanStack Query for blazing-fast performance.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ─── Ambient Background Glows ─── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-48 -left-48 size-[500px] rounded-full bg-primary/[0.07] blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-48 -right-48 size-[500px] rounded-full bg-primary/[0.05] blur-[120px] animate-pulse-glow-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/[0.03] blur-[150px]" />
      </div>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-28 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8 ${
              mounted ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <FileSpreadsheet className="size-3.5" />
            <span>RFP Dashboard — Tender Management Reimagined</span>
          </div>

          {/* Main Headline */}
          <h1
            className={`text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] ${
              mounted
                ? "animate-fade-in-up animation-delay-100"
                : "opacity-0"
            }`}
          >
            Manage Tenders
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient-shimmer">
              with Intelligence
            </span>
          </h1>

          {/* Typewriter Subtitle */}
          <div
            className={`mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto ${
              mounted
                ? "animate-fade-in-up animation-delay-200"
                : "opacity-0"
            }`}
          >
            <span className="text-foreground/70">We help you </span>
            <span className="text-primary font-semibold inline-block min-w-[200px] text-left">
              {mounted && (
                <Typewriter
                  options={{
                    strings: [
                      "track tenders effortlessly",
                      "extract data with AI",
                      "collaborate in real-time",
                      "manage bids at scale",
                      "optimize your workflow",
                    ],
                    autoStart: true,
                    loop: true,
                    deleteSpeed: 30,
                    delay: 50,
                  }}
                />
              )}
            </span>
          </div>

          {/* Description paragraph */}
          <p
            className={`mt-5 text-sm text-muted-foreground/80 max-w-xl mx-auto leading-relaxed ${
              mounted
                ? "animate-fade-in-up animation-delay-300"
                : "opacity-0"
            }`}
          >
            An AI-powered RFP management platform that automates tender extraction, 
            tracks bid lifecycles, and enables seamless team collaboration — built for 
            enterprise-grade procurement teams.
          </p>

          {/* CTA Buttons */}
          <div
            className={`mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 ${
              mounted
                ? "animate-fade-in-up animation-delay-400"
                : "opacity-0"
            }`}
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 hover:brightness-110"
            >
              Go to Dashboard
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur-sm px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-accent hover:border-primary/20 hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>

          {/* Trust Indicators */}
          <div
            className={`mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground ${
              mounted
                ? "animate-fade-in-up animation-delay-500"
                : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Shield className="size-3.5 text-emerald-500" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Google Gemini AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-violet-500" />
              <span>Real-time Processing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="size-3.5 text-sky-500" />
              <span>Cloud Native</span>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div
            className={`mt-5 flex flex-wrap items-center justify-center gap-2 ${
              mounted
                ? "animate-fade-in-up animation-delay-600"
                : "opacity-0"
            }`}
          >
            {["Next.js 16", "React 19", "TypeScript", "Drizzle ORM", "PostgreSQL", "TailwindCSS"].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border/60 bg-card/40 px-3 py-1 text-[10px] font-medium text-muted-foreground/70 backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* ─── Dashboard Preview Mockup ─── */}
        <div
          className={`mt-16 mx-auto w-full max-w-5xl ${
            mounted
              ? "animate-fade-in-up animation-delay-700"
              : "opacity-0"
          }`}
        >
          <div className="relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md shadow-2xl shadow-primary/[0.04] overflow-hidden">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-red-400/70" />
                <div className="size-2.5 rounded-full bg-amber-400/70" />
                <div className="size-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="ml-3 flex-1 flex items-center">
                <div className="flex items-center gap-2 rounded-md bg-background/60 border border-border/30 px-3 py-1 text-[10px] text-muted-foreground/60 max-w-xs w-full">
                  <Lock className="size-2.5 text-emerald-500/70" />
                  <span>rfp-dashboard.app/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard Body */}
            <div className="p-5 bg-gradient-to-b from-card/80 to-card/40">
              {/* Top bar mockup */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <FileSpreadsheet className="size-3.5 text-primary/70" />
                  </div>
                  <div>
                    <div className="h-3 w-44 rounded bg-foreground/10" />
                    <div className="h-2 w-24 rounded bg-muted-foreground/10 mt-1.5" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-20 rounded-md bg-primary/10 border border-primary/10" />
                  <div className="size-7 rounded-full bg-muted/60" />
                </div>
              </div>

              {/* Stats row mockup */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Total Tenders", value: "47", color: "from-blue-500/10 to-indigo-500/5" },
                  { label: "Due This Week", value: "8", color: "from-amber-500/10 to-orange-500/5" },
                  { label: "Bids Submitted", value: "31", color: "from-emerald-500/10 to-green-500/5" },
                  { label: "Portfolio Value", value: "₹24.5Cr", color: "from-violet-500/10 to-purple-500/5" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-lg border border-border/30 bg-gradient-to-br ${stat.color} p-3`}
                  >
                    <div className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                      {stat.label}
                    </div>
                    <div className="mt-1 text-lg font-bold text-foreground/70 tabular-nums">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table mockup */}
              <div className="rounded-lg border border-border/30 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-5 gap-px bg-muted/20 px-4 py-2 border-b border-border/20">
                  {["Tender ID", "Client Name", "State", "Value", "Status"].map((h) => (
                    <div key={h} className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                      {h}
                    </div>
                  ))}
                </div>
                {/* Table rows */}
                {[
                  { id: "RFP-2026-047", client: "BSNL", state: "Maharashtra", value: "₹4.2Cr", status: "In Review", statusColor: "bg-amber-400/70" },
                  { id: "RFP-2026-046", client: "ONGC", state: "Gujarat", value: "₹7.8Cr", status: "Submitted", statusColor: "bg-emerald-400/70" },
                  { id: "RFP-2026-045", client: "Indian Railways", state: "Delhi", value: "₹12.1Cr", status: "Draft", statusColor: "bg-slate-400/60" },
                ].map((row, i) => (
                  <div
                    key={row.id}
                    className={`grid grid-cols-5 gap-px px-4 py-2.5 ${i < 2 ? "border-b border-border/10" : ""} hover:bg-muted/10 transition-colors`}
                  >
                    <div className="text-[10px] font-mono text-primary/60">{row.id}</div>
                    <div className="text-[10px] font-medium text-foreground/60">{row.client}</div>
                    <div className="text-[10px] text-muted-foreground/60">{row.state}</div>
                    <div className="text-[10px] font-semibold text-foreground/60 tabular-nums">{row.value}</div>
                    <div className="flex items-center gap-1.5">
                      <div className={`size-1.5 rounded-full ${row.statusColor}`} />
                      <span className="text-[10px] text-muted-foreground/60">{row.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient overlay at bottom for fade effect */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`mt-14 ${
            mounted
              ? "animate-fade-in-up animation-delay-800"
              : "opacity-0"
          }`}
        >
          <div className="animate-subtle-bounce">
            <ChevronDown className="size-5 text-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="relative z-10 border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div
          ref={statsSection.ref}
          className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 px-6 py-14"
        >
          <StatItem
            value="100%"
            label="AI Accuracy"
            delay="animation-delay-100"
          />
          <StatItem
            value="10x"
            label="Faster Extraction"
            delay="animation-delay-200"
          />
          <StatItem
            value="SHA-256"
            label="Duplicate Detection"
            delay="animation-delay-300"
          />
          <StatItem
            value="24/7"
            label="Cloud Availability"
            delay="animation-delay-400"
          />
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div
            ref={featuresSection.ref}
            className={`text-center mb-16 ${
              featuresSection.isInView
                ? "animate-fade-in-up"
                : "opacity-0"
            }`}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Features
            </span>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything you need to manage RFPs
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From AI-powered data extraction to team collaboration — a complete
              toolkit for modern tender management.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={`animation-delay-${(i + 1) * 100}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative z-10 px-6 py-24">
        <div
          ref={ctaSection.ref}
          className={`mx-auto max-w-3xl text-center ${
            ctaSection.isInView ? "animate-fade-in-scale" : "opacity-0"
          }`}
        >
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/[0.04] p-12 md:p-16">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 size-48 rounded-full bg-primary/[0.06] blur-3xl" />
            <div className="absolute -bottom-24 -left-24 size-48 rounded-full bg-primary/[0.04] blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
                Access your dashboard and start managing tenders with AI-powered
                intelligence today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 hover:brightness-110"
                >
                  Open Dashboard
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-accent hover:border-primary/20 hover:-translate-y-0.5"
                >
                  Sign In to Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileSpreadsheet className="size-4" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                RFP Dashboard
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MagNetix InfoSystems & Development
              Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
