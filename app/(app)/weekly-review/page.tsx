export default function WeeklyReviewPage() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <h1 className="text-3xl font-semibold">Weekly Review</h1>
      <p className="mt-2 text-muted-foreground">
        OpenAI-powered summary of strengths, weaknesses, repeated mistakes, and action points.
      </p>
      <section className="glass mt-8 rounded-2xl p-6">
        <h2 className="text-lg font-medium">AI Summary Panel (Scaffold)</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect weekly trade notes + data here and call OpenAI for generated coaching.
        </p>
      </section>
    </main>
  );
}
