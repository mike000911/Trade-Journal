import { TradeEntryForm } from "@/components/forms/trade-entry-form";

export default function NewTradePage() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <h1 className="text-3xl font-semibold">New Manual Trade</h1>
      <p className="mt-2 text-muted-foreground">Capture setup context and execution notes.</p>
      <TradeEntryForm />
    </main>
  );
}
