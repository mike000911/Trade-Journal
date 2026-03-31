import { ArrowRight, LineChart, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    title: "Nasdaq-only focus",
    description: "Structure every review around the symbols, sessions, and behavior that matter most.",
    icon: LineChart
  },
  {
    title: "Manual-first journaling",
    description: "Capture intentional entries and context-rich lessons without noisy broker imports.",
    icon: ShieldCheck
  }
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-[28rem] w-[28rem] rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      <section className="container relative z-10 py-28 md:py-36">
        <p className="mb-6 inline-flex rounded-full border border-border bg-card/50 px-4 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Built for discretionary Nasdaq traders
        </p>
        <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl md:leading-[1.05]">
          Journal every decision.
          <span className="block text-muted-foreground">Compound execution quality.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          A premium trade journal for manual entries, post-trade storytelling, and weekly AI coaching.
          Built for NASDAQ-focused routines.
        </p>
        <div className="mt-12 flex flex-wrap gap-4">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Enter Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">Explore Features</Link>
          </Button>
        </div>
      </section>

      <section id="features" className="container relative z-10 grid gap-4 pb-20 md:grid-cols-2">
        {highlights.map((item, index) => (
          <article
            key={item.title}
            className="glass rounded-2xl p-7 opacity-0 shadow-2xl shadow-black/30"
            style={{ animation: `fade-in 0.8s ease-out ${index * 0.15 + 0.2}s forwards` }}
          >
            <item.icon className="mb-4 h-6 w-6 text-primary" />
            <h2 className="text-xl font-medium">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
