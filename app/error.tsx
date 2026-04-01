"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="glass w-full max-w-2xl rounded-[2rem] p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Application issue</p>
        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">Something went wrong while loading this page.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          The request hit a server-side error. If this keeps happening in production, check your Vercel
          environment variables and function logs for the matching digest.
        </p>

        {error.digest ? (
          <div className="mt-6 rounded-2xl border border-border/70 bg-card/35 px-4 py-3 text-sm text-muted-foreground">
            Error digest: <span className="font-medium text-foreground">{error.digest}</span>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
