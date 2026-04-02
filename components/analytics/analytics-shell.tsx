"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarRange,
  Clock3,
  ScrollText,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalyticsScatterPoint, AnalyticsSnapshot } from "@/lib/analytics";

const axisStroke = "rgba(148, 163, 184, 0.45)";
const gridStroke = "rgba(148, 163, 184, 0.08)";
const tooltipStyle = {
  backgroundColor: "rgba(8, 11, 24, 0.96)",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  borderRadius: "18px",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
  color: "#e5eefb"
};

function formatSignedCurrency(value: number) {
  if (value > 0) {
    return `+$${value.toFixed(2)}`;
  }

  if (value < 0) {
    return `-$${Math.abs(value).toFixed(2)}`;
  }

  return "$0.00";
}

function formatCompactSigned(value: number) {
  if (!value) {
    return "$0";
  }

  const absolute = Math.abs(value);
  const compact =
    absolute >= 1000 ? `$${(absolute / 1000).toFixed(1)}k` : `$${absolute.toFixed(0)}`;

  return value > 0 ? `+${compact}` : `-${compact}`;
}

function formatHourLabel(hour: number) {
  const roundedHour = Math.floor(hour);
  const minutes = Math.round((hour - roundedHour) * 60);

  return `${`${roundedHour}`.padStart(2, "0")}:${`${minutes}`.padStart(2, "0")}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!remainder) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
}

function getHeatmapBackground(totalPnl: number, intensity: number) {
  if (!intensity) {
    return "rgba(22, 28, 45, 0.45)";
  }

  const alpha = 0.18 + intensity * 0.72;

  if (totalPnl > 0) {
    return `rgba(52, 211, 153, ${alpha})`;
  }

  if (totalPnl < 0) {
    return `rgba(251, 113, 133, ${alpha})`;
  }

  return `rgba(96, 165, 250, ${alpha})`;
}

function EmptyPanel({
  description,
  title
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="flex h-[17rem] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <div>
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function CircularMeter({
  label,
  progress,
  tone
}: {
  label: string;
  progress: number;
  tone: "negative" | "neutral" | "positive";
}) {
  const color =
    tone === "positive"
      ? "#34d399"
      : tone === "negative"
        ? "#fb7185"
        : "#7dd3fc";

  return (
    <div className="relative h-16 w-16 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${Math.max(progress, 2) * 3.6}deg, rgba(100, 116, 139, 0.14) 0deg)`
        }}
      />
      <div className="absolute inset-[7px] rounded-full border border-white/10 bg-[#07101f]" />
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
        {label}
      </div>
    </div>
  );
}

function MetricPanel({ metric }: { metric: AnalyticsSnapshot["metrics"][number] }) {
  return (
    <article className="analytics-panel rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
          <p
            className={cn(
              "mt-3 text-2xl font-semibold tracking-tight",
              metric.tone === "positive"
                ? "text-emerald-300"
                : metric.tone === "negative"
                  ? "text-rose-300"
                  : "text-slate-100"
            )}
          >
            {metric.value}
          </p>
          <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-slate-400">{metric.detail}</p>
        </div>

        <CircularMeter label={metric.progressLabel} progress={metric.progress} tone={metric.tone} />
      </div>
    </article>
  );
}

function PanelHeader({
  icon: Icon,
  subtitle,
  title
}: {
  icon: ComponentType<{ className?: string }>;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">
          <Icon className="h-3.5 w-3.5" />
          {title}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function StatGrid({ items }: { items: AnalyticsSnapshot["overview"] }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
          <p className="mt-2 text-sm font-medium text-slate-100">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function buildScatterGroups(data: AnalyticsScatterPoint[]) {
  return {
    losses: data.filter((point) => point.outcomeTone === "negative"),
    neutrals: data.filter((point) => point.outcomeTone === "neutral"),
    wins: data.filter((point) => point.outcomeTone === "positive")
  };
}

function CumulativePanel({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <article className="analytics-panel rounded-[30px] p-5 md:p-6 xl:col-span-6">
      <PanelHeader
        icon={TrendingUp}
        title="Cumulative P&L"
        subtitle="See how the equity curve evolves trade by trade, with the best and worst outliers called out below."
      />

      {snapshot.cumulativePnl.length ? (
        <div className="mt-6 h-[21rem]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={snapshot.cumulativePnl}>
              <defs>
                <linearGradient id="analytics-equity-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.42} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis axisLine={false} dataKey="sequence" minTickGap={24} stroke={axisStroke} tickLine={false} />
              <YAxis
                axisLine={false}
                stroke={axisStroke}
                tickFormatter={formatCompactSigned}
                tickLine={false}
                width={78}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatSignedCurrency(value), "Cumulative P&L"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload
                    ? `${payload[0].payload.symbol} - ${payload[0].payload.dateLabel}`
                    : "Trade"
                }
              />
              <Area
                dataKey="cumulativePnl"
                fill="url(#analytics-equity-fill)"
                stroke="#6ee7b7"
                strokeWidth={3}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyPanel
            title="No equity curve yet"
            description="Save trades from the calendar and the running P&L curve will start plotting here automatically."
          />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {snapshot.cumulativeHighlights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function DistributionPanel({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <article className="analytics-panel rounded-[30px] p-5 md:p-6 xl:col-span-3">
      <PanelHeader
        icon={BarChart3}
        title="PnL Distribution"
        subtitle="A histogram of individual trade outcomes so you can spot whether results cluster tightly or swing wide."
      />

      {snapshot.distribution.length ? (
        <div className="mt-6 h-[21rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={snapshot.distribution}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis axisLine={false} dataKey="label" hide stroke={axisStroke} tickLine={false} />
              <YAxis axisLine={false} stroke={axisStroke} tickLine={false} width={38} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [value, "Trades"]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                {snapshot.distribution.map((bucket) => (
                  <Cell
                    key={bucket.label}
                    fill={
                      bucket.midpoint > 0
                        ? "rgba(52, 211, 153, 0.85)"
                        : bucket.midpoint < 0
                          ? "rgba(251, 113, 133, 0.82)"
                          : "rgba(125, 211, 252, 0.82)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyPanel
            title="No distribution yet"
            description="Once trades are logged, this chart will show how tightly your winners and losers are grouped."
          />
        </div>
      )}
    </article>
  );
}

function ScorePanel({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <article className="analytics-panel rounded-[30px] p-5 md:p-6 xl:col-span-3">
      <PanelHeader
        icon={ShieldCheck}
        title="Trader Score"
        subtitle="A five-part scorecard summarizing process discipline, risk handling, and expectancy quality."
      />

      <div className="mt-6 h-[15rem]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={snapshot.score.breakdown}>
            <PolarGrid stroke="rgba(148, 163, 184, 0.18)" />
            <PolarAngleAxis
              dataKey="label"
              stroke="rgba(226, 232, 240, 0.8)"
              tick={{ fill: "rgba(226, 232, 240, 0.82)", fontSize: 11 }}
            />
            <Radar
              dataKey="score"
              fill="rgba(96, 165, 250, 0.32)"
              fillOpacity={1}
              stroke="#7dd3fc"
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`${Math.round(value)}/100`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Overall score</p>
            <p className="mt-2 text-3xl font-semibold text-slate-50">{snapshot.score.total}</p>
          </div>
          <p className="text-sm text-slate-400">0-100</p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#fb7185_0%,#f59e0b_45%,#34d399_100%)]"
            style={{ width: `${snapshot.score.total}%` }}
          />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-400">{snapshot.score.caption}</p>
      </div>
    </article>
  );
}

function HeatmapPanel({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <article className="analytics-panel rounded-[30px] p-5 md:p-6 xl:col-span-4">
      <PanelHeader
        icon={CalendarRange}
        title="Weekday x Time Heatmap"
        subtitle="Find when performance clusters across the week using two-hour entry windows."
      />

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[38rem]">
          <div className="grid grid-cols-[70px_repeat(12,minmax(0,1fr))] gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
            <div />
            {snapshot.heatmap.columns.map((column) => (
              <div key={column} className="text-center">
                {column}
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {snapshot.heatmap.rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[70px_repeat(12,minmax(0,1fr))] gap-2">
                <div className="flex items-center text-sm font-medium text-slate-300">{row.label}</div>
                {row.cells.map((cell) => (
                  <div
                    key={`${row.label}-${cell.bucketLabel}`}
                    className="group relative aspect-square rounded-xl border border-white/5 transition hover:scale-[1.03]"
                    style={{ backgroundColor: getHeatmapBackground(cell.totalPnl, cell.intensity) }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),transparent_58%)] opacity-0 transition group-hover:opacity-100" />
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#07101f] px-3 py-2 text-left text-xs leading-relaxed text-slate-200 shadow-2xl group-hover:block">
                      {cell.tooltip}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {snapshot.heatmapHighlights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function SessionPanel({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <article className="analytics-panel rounded-[30px] p-5 md:p-6 xl:col-span-4">
      <PanelHeader
        icon={Activity}
        title="Session Performance"
        subtitle="Compare where the money is being made across premarket, open, midday, power hour, and after-hours."
      />

      {snapshot.sessionPerformance.length ? (
        <div className="mt-6 h-[19rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={snapshot.sessionPerformance} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid horizontal={false} stroke={gridStroke} />
              <XAxis
                axisLine={false}
                stroke={axisStroke}
                tickFormatter={formatCompactSigned}
                tickLine={false}
                type="number"
              />
              <YAxis
                axisLine={false}
                dataKey="label"
                stroke={axisStroke}
                tickLine={false}
                type="category"
                width={86}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name) => [
                  name === "totalPnl" ? formatSignedCurrency(value) : value,
                  name === "totalPnl" ? "Total P&L" : name === "trades" ? "Trades" : "Win Rate"
                ]}
              />
              <Bar dataKey="totalPnl" radius={[0, 10, 10, 0]}>
                {snapshot.sessionPerformance.map((session) => (
                  <Cell
                    key={session.label}
                    fill={session.totalPnl >= 0 ? "rgba(96, 165, 250, 0.82)" : "rgba(251, 113, 133, 0.82)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyPanel
            title="No session data yet"
            description="Session bars will populate after you log trades with entry times."
          />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {snapshot.sessionHighlights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function TimeScatterPanel({
  groups,
  snapshot
}: {
  groups: ReturnType<typeof buildScatterGroups>;
  snapshot: AnalyticsSnapshot;
}) {
  return (
    <article className="analytics-panel rounded-[30px] p-5 md:p-6 xl:col-span-4">
      <PanelHeader
        icon={Clock3}
        title="Trade Time Scatter"
        subtitle="Each dot is a trade, plotted by entry time so you can spot hot and cold windows."
      />

      {snapshot.timePerformance.length ? (
        <div className="mt-6 h-[19rem]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ left: 8, right: 8 }}>
              <CartesianGrid stroke={gridStroke} />
              <XAxis
                axisLine={false}
                dataKey="x"
                domain={[0, 24]}
                stroke={axisStroke}
                tickFormatter={formatHourLabel}
                tickLine={false}
                type="number"
              />
              <YAxis
                axisLine={false}
                dataKey="y"
                stroke={axisStroke}
                tickFormatter={formatCompactSigned}
                tickLine={false}
                type="number"
                width={68}
              />
              <ReferenceLine stroke="rgba(226, 232, 240, 0.18)" y={0} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name) => [
                  name === "y" ? formatSignedCurrency(value) : formatHourLabel(value),
                  name === "y" ? "P&L" : "Entry time"
                ]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload
                    ? `${payload[0].payload.label} - ${payload[0].payload.meta}`
                    : "Trade"
                }
              />
              <Scatter data={groups.losses} fill="rgba(251, 113, 133, 0.85)" />
              <Scatter data={groups.neutrals} fill="rgba(125, 211, 252, 0.85)" />
              <Scatter data={groups.wins} fill="rgba(52, 211, 153, 0.85)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyPanel
            title="Entry-time chart unavailable"
            description="Add trades with entry times to unlock timing scatter analysis."
          />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {snapshot.timeHighlights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function DurationScatterPanel({
  groups,
  snapshot
}: {
  groups: ReturnType<typeof buildScatterGroups>;
  snapshot: AnalyticsSnapshot;
}) {
  return (
    <article className="analytics-panel rounded-[30px] p-5 md:p-6 xl:col-span-4">
      <PanelHeader
        icon={Clock3}
        title="Duration vs P&L"
        subtitle="Look for whether the best trades are quick scalps, standard intraday holds, or longer runners."
      />

      {snapshot.durationPerformance.length ? (
        <div className="mt-6 h-[19rem]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ left: 8, right: 8 }}>
              <CartesianGrid stroke={gridStroke} />
              <XAxis
                axisLine={false}
                dataKey="x"
                stroke={axisStroke}
                tickFormatter={formatDuration}
                tickLine={false}
                type="number"
              />
              <YAxis
                axisLine={false}
                dataKey="y"
                stroke={axisStroke}
                tickFormatter={formatCompactSigned}
                tickLine={false}
                type="number"
                width={68}
              />
              <ReferenceLine stroke="rgba(226, 232, 240, 0.18)" y={0} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name) => [
                  name === "y" ? formatSignedCurrency(value) : formatDuration(value),
                  name === "y" ? "P&L" : "Duration"
                ]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload
                    ? `${payload[0].payload.label} - ${payload[0].payload.meta}`
                    : "Trade"
                }
              />
              <Scatter data={groups.losses} fill="rgba(251, 113, 133, 0.85)" />
              <Scatter data={groups.neutrals} fill="rgba(125, 211, 252, 0.85)" />
              <Scatter data={groups.wins} fill="rgba(52, 211, 153, 0.85)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyPanel
            title="Duration chart unavailable"
            description="Log trade duration in minutes and this chart will show how hold time affects P&L."
          />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {snapshot.durationHighlights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function SetupPanel({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <article className="analytics-panel rounded-[30px] p-5 md:p-6 xl:col-span-4">
      <PanelHeader
        icon={TrendingUp}
        title="Setup Performance"
        subtitle="Rank the strategies you use most so it is easier to double down on the ones carrying the book."
      />

      {snapshot.setupPerformance.length ? (
        <div className="mt-6 h-[19rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={snapshot.setupPerformance} layout="vertical" margin={{ left: 14, right: 8 }}>
              <CartesianGrid horizontal={false} stroke={gridStroke} />
              <XAxis
                axisLine={false}
                stroke={axisStroke}
                tickFormatter={formatCompactSigned}
                tickLine={false}
                type="number"
              />
              <YAxis
                axisLine={false}
                dataKey="label"
                stroke={axisStroke}
                tickLine={false}
                type="category"
                width={92}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name) => [
                  name === "totalPnl" ? formatSignedCurrency(value) : value,
                  name === "totalPnl" ? "Total P&L" : name === "trades" ? "Trades" : "Win Rate"
                ]}
              />
              <Bar dataKey="totalPnl" radius={[0, 10, 10, 0]}>
                {snapshot.setupPerformance.map((setup) => (
                  <Cell
                    key={setup.label}
                    fill={setup.totalPnl >= 0 ? "rgba(52, 211, 153, 0.8)" : "rgba(251, 113, 133, 0.8)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyPanel
            title="No setup ranking yet"
            description="As you repeat setup names in the journal, this panel will start ranking them by performance."
          />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {snapshot.setupHighlights.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function RecentTradesPanel({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <article className="analytics-panel rounded-[30px] p-5 md:p-6 xl:col-span-4">
      <PanelHeader
        icon={ScrollText}
        title="Recent Trades"
        subtitle="A quick tape of the latest entries so the chart-heavy view still keeps concrete trades in sight."
      />

      {snapshot.recentTrades.length ? (
        <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10">
          <div className="grid grid-cols-[1.2fr_0.75fr_0.8fr_1fr_0.9fr] gap-3 bg-white/[0.04] px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-slate-500">
            <div>Trade</div>
            <div>Time</div>
            <div>Session</div>
            <div>P&amp;L</div>
            <div>Duration</div>
          </div>

          <div className="divide-y divide-white/10">
            {snapshot.recentTrades.map((trade) => (
              <div
                key={`${trade.symbol}-${trade.dateLabel}-${trade.timeLabel}`}
                className="grid grid-cols-[1.2fr_0.75fr_0.8fr_1fr_0.9fr] gap-3 px-4 py-3 text-sm text-slate-300"
              >
                <div>
                  <p className="font-medium text-slate-100">{trade.symbol}</p>
                  <p className="mt-1 text-xs text-slate-500">{trade.dateLabel}</p>
                </div>
                <div className="self-center">{trade.timeLabel}</div>
                <div className="self-center text-xs text-slate-400">{trade.sessionLabel}</div>
                <div
                  className={cn(
                    "self-center font-medium",
                    trade.tone === "positive"
                      ? "text-emerald-300"
                      : trade.tone === "negative"
                        ? "text-rose-300"
                        : "text-slate-100"
                  )}
                >
                  {trade.pnlLabel}
                </div>
                <div className="self-center text-slate-400">{trade.durationLabel}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyPanel
            title="No recent trades yet"
            description="The latest trade tape will appear here once journal entries start coming in."
          />
        </div>
      )}
    </article>
  );
}

export function AnalyticsShell({
  snapshot,
  userName
}: {
  snapshot: AnalyticsSnapshot;
  userName: string;
}) {
  const timeGroups = buildScatterGroups(snapshot.timePerformance);
  const durationGroups = buildScatterGroups(snapshot.durationPerformance);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 md:px-10">
      <div className="analytics-backdrop pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_48%)]" />
      <div className="pointer-events-none absolute -left-16 top-40 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

      <section className="relative mx-auto max-w-7xl">
        <header className="analytics-panel rounded-[32px] p-6 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">Analytics</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 md:text-5xl">
                Performance intelligence for {userName}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-400 md:text-base">
                This tab turns the trade journal into a visual review desk: equity behavior, timing edge,
                setup quality, and execution discipline are all pulled from your recorded trades.
              </p>

              <StatGrid items={snapshot.overview} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/calendar">Open Calendar</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/trades/new">Log Another Trade</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {snapshot.metrics.map((metric) => (
            <MetricPanel key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-12">
          <CumulativePanel snapshot={snapshot} />
          <DistributionPanel snapshot={snapshot} />
          <ScorePanel snapshot={snapshot} />
          <HeatmapPanel snapshot={snapshot} />
          <SessionPanel snapshot={snapshot} />
          <TimeScatterPanel groups={timeGroups} snapshot={snapshot} />
          <DurationScatterPanel groups={durationGroups} snapshot={snapshot} />
          <SetupPanel snapshot={snapshot} />
          <RecentTradesPanel snapshot={snapshot} />
        </section>
      </section>
    </main>
  );
}
