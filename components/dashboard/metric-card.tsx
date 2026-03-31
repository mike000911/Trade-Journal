interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="glass rounded-2xl p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}
