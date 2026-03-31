const fields = [
  "date",
  "session",
  "direction",
  "entry",
  "exit",
  "stop loss",
  "take profit",
  "position size",
  "PnL",
  "R multiple",
  "setup type",
  "bias",
  "liquidity target",
  "entry reason",
  "exit reason",
  "emotion",
  "rule adherence",
  "mistake type",
  "lesson",
  "screenshots"
];

export function TradeEntryForm() {
  return (
    <section className="glass mt-8 rounded-2xl p-6">
      <h2 className="text-xl font-medium">Trade Entry Form Scaffold</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This scaffold includes every required field for manual trade input.
      </p>
      <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
        {fields.map((field) => (
          <li key={field} className="rounded-lg border border-border/70 bg-card/40 px-3 py-2 capitalize">
            {field}
          </li>
        ))}
      </ul>
    </section>
  );
}
