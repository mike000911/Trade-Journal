import { EquityCurveCard } from "./equity-curve-card";
import { MetricCard } from "./metric-card";

const metrics = [
  { label: "Win Rate", value: "61.8%" },
  { label: "Avg Win", value: "$412" },
  { label: "Avg Loss", value: "-$236" },
  { label: "Biggest Win", value: "$1,240" },
  { label: "Biggest Loss", value: "-$680" },
  { label: "Profit Factor", value: "1.92" },
  { label: "Expectancy", value: "$88/trade" },
  { label: "Total PnL", value: "$7,940" },
  { label: "Session Performance", value: "NY Open +14R" }
];

export function DashboardShell() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-10">
      <header className="mx-auto mb-8 max-w-7xl">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold">Performance Overview</h1>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </section>

      <section className="mx-auto mt-6 max-w-7xl">
        <EquityCurveCard />
      </section>
    </main>
  );
}
