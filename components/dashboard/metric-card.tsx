interface MetricCardProps {
  detail: string;
  label: string;
  value: string;
}

export function MetricCard({ detail, label, value }: MetricCardProps) {
  return (
    <article className="glass rounded-2xl p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
    </article>
  );
}
