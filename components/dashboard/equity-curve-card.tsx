import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const equityData = [
  { week: "W1", equity: 1200 },
  { week: "W2", equity: 1860 },
  { week: "W3", equity: 1540 },
  { week: "W4", equity: 2420 },
  { week: "W5", equity: 3180 },
  { week: "W6", equity: 4020 }
];

export function EquityCurveCard() {
  return (
    <article className="glass rounded-2xl p-5">
      <h2 className="text-lg font-medium">Equity Curve</h2>
      <p className="mt-1 text-sm text-muted-foreground">Weekly realized PnL trend</p>
      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={equityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.45)" />
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
    </article>
  );
}
