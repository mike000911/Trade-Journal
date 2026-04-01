"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { EquityPoint } from "@/lib/dashboard";

interface EquityCurveCardProps {
  data: EquityPoint[];
}

export function EquityCurveCard({ data }: EquityCurveCardProps) {
  return (
    <article className="glass rounded-2xl p-5">
      <h2 className="text-lg font-medium">Trade Activity</h2>
      <p className="mt-1 text-sm text-muted-foreground">Cumulative trades logged by week</p>

      {data.length ? (
        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.45)" />
              <YAxis stroke="rgba(255,255,255,0.45)" />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(12, 16, 31, 0.9)",
                  color: "#e2e8f0"
                }}
              />
              <Line type="monotone" dataKey="equity" stroke="#60a5fa" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card/30 p-8 text-sm text-muted-foreground">
          Save your first trade from the calendar to start plotting the curve.
        </div>
      )}
    </article>
  );
}
