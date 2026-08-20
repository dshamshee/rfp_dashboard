"use client";

/**
 * Minimal & Creative Background Shapes for Premium Enterprise Dashboard
 * Renders non-intrusive geometric elements, ambient glow orbs, and grid textures.
 */
export function BackgroundShapes() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── 1. Subtle Ambient Glow Mesh Orbs ── */}
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/15 via-indigo-500/10 to-transparent blur-3xl animate-pulse-glow" />
      <div className="absolute top-[45%] -right-32 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-violet-500/10 via-blue-500/10 to-transparent blur-3xl animate-pulse-glow-delayed" />
      <div className="absolute -bottom-40 left-[20%] h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-sky-500/10 via-primary/10 to-transparent blur-3xl animate-pulse-glow" />

      {/* ── 2. Subtle Precision Grid Overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      {/* ── 3. Minimal Creative Geometric Shapes ── */}

      {/* Floating Concentric Precision Rings (Top Left) */}
      <div className="absolute top-12 left-[15%] opacity-20 dark:opacity-30 animate-float-slow">
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
          <circle cx="90" cy="90" r="88" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-primary" />
          <circle cx="90" cy="90" r="60" stroke="currentColor" strokeWidth="1" className="text-primary/60" />
          <circle cx="90" cy="90" r="32" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
          <circle cx="90" cy="90" r="4" fill="currentColor" className="text-primary" />
        </svg>
      </div>

      {/* Tilted Minimalist Rounded Glass Frame (Shifted down with increased top margin behind Portfolio Value card) */}
      <div className="absolute top-[36%] right-[6%] h-48 w-48 rotate-12 rounded-3xl border border-primary/15 bg-primary/[0.02] backdrop-blur-[2px] shadow-xs animate-float-delayed" />

      {/* Minimal Floating Diamond Frame (Mid Left) */}
      <div className="absolute top-[52%] left-[4%] h-28 w-28 rotate-45 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.02] animate-float-slow" />

      {/* Floating Pill Accent Outline (Bottom Right) */}
      <div className="absolute bottom-[16%] right-[14%] h-14 w-44 -rotate-6 rounded-full border border-sky-500/20 bg-sky-500/[0.02] animate-float-delayed" />

      {/* Architectural Crosshair / Plus Grid Markers */}
      <div className="absolute top-[32%] left-[30%] opacity-25 dark:opacity-35">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute top-[68%] right-[28%] opacity-25 dark:opacity-35">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Glowing Accent Micro-Nodes */}
      <div className="absolute top-[25%] left-[45%] h-2 w-2 rounded-full bg-primary/40 shadow-[0_0_10px_2px_rgba(79,70,229,0.3)] animate-ping-slow" />
      <div className="absolute top-[75%] left-[18%] h-2 w-2 rounded-full bg-sky-400/40 shadow-[0_0_10px_2px_rgba(56,189,248,0.3)] animate-ping-slow" />
      <div className="absolute top-[48%] right-[20%] h-2.5 w-2.5 rounded-full bg-violet-400/40 shadow-[0_0_12px_2px_rgba(167,139,250,0.3)] animate-ping-slow" />
    </div>
  );
}
