import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EquityCurveCard } from "@/components/dashboard/equity-curve-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TradeCalendarCard } from "@/components/dashboard/trade-calendar-card";
import type { CalendarCell, DashboardMetric, EquityPoint } from "@/lib/dashboard";

interface DashboardShellProps {
  calendarDays: CalendarCell[];
  equityData: EquityPoint[];
  metrics: DashboardMetric[];
  monthKey: string;
  monthLabel: string;
  nextMonthKey: string;
  previousMonthKey: string;
  userName: string;
}

export function DashboardShell({
  calendarDays,
  equityData,
  metrics,
  monthKey,
  monthLabel,
  nextMonthKey,
  previousMonthKey,
  userName
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-10">
      <header className="mx-auto mb-8 flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Welcome back, {userName}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Review performance, open a trading day from the calendar, and keep each trader&apos;s notes stored in the shared database.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/calendar">Open Calendar</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/calendar?date=${new Date().toISOString().slice(0, 10)}`}>Log Today&apos;s Plan</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} detail={metric.detail} label={metric.label} value={metric.value} />
        ))}
      </section>

      <section className="mx-auto mt-6 grid max-w-7xl gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <EquityCurveCard data={equityData} />
        <TradeCalendarCard
          days={calendarDays}
          monthKey={monthKey}
          monthLabel={monthLabel}
          nextMonthKey={nextMonthKey}
          previousMonthKey={previousMonthKey}
        />
      </section>
    </main>
  );
}
