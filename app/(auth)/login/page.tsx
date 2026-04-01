import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction, signInAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getSingleSearchParam } from "@/lib/date";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    message?: string | string[];
    mode?: string | string[];
  }>;
};

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-border/70 bg-card/50 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = (await searchParams) ?? {};
  const error = getSingleSearchParam(params.error);
  const message = getSingleSearchParam(params.message);
  const mode = getSingleSearchParam(params.mode) === "register" ? "register" : "signin";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="glass rounded-[2rem] p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Multi-user trade journal</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
            Keep every trader&apos;s journal, calendar, and review history in one database.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Create accounts for each person, sign in from any device, and track daily pre-game plans,
            emotions, and manual trades from a shared web app.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              "Account-based access with isolated trade history",
              "Clickable calendar journaling for each trading day",
              "Manual entries for stops, emotions, setups, and notes"
            ].map((item) => (
              <article key={item} className="rounded-2xl border border-border/70 bg-card/40 p-5 text-sm text-muted-foreground">
                {item}
              </article>
            ))}
          </div>
        </section>

        <section className="glass rounded-[2rem] p-6 md:p-8">
          {(error || message) && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                error
                  ? "border-red-500/30 bg-red-500/10 text-red-100"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
              }`}
            >
              {error ?? message}
            </div>
          )}

          <div className="mt-6 grid gap-4">
            <form action={signInAction} className={`rounded-2xl border p-5 ${mode === "signin" ? "border-primary/50 bg-card/60" : "border-border/70 bg-card/35"}`}>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sign in</p>
              <h2 className="mt-3 text-2xl font-semibold">Welcome back</h2>

              <label className="mt-5 block text-sm text-muted-foreground">
                Email
                <input className={fieldClassName} type="email" name="email" placeholder="trader@example.com" required />
              </label>

              <label className="mt-4 block text-sm text-muted-foreground">
                Password
                <input className={fieldClassName} type="password" name="password" placeholder="Enter your password" required />
              </label>

              <Button className="mt-6 w-full">Open Dashboard</Button>
            </form>

            <form action={registerAction} className={`rounded-2xl border p-5 ${mode === "register" ? "border-primary/50 bg-card/60" : "border-border/70 bg-card/35"}`}>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Create account</p>
              <h2 className="mt-3 text-2xl font-semibold">Set up a new trader</h2>

              <label className="mt-5 block text-sm text-muted-foreground">
                Display name
                <input className={fieldClassName} type="text" name="displayName" placeholder="Mike Trader" />
              </label>

              <label className="mt-4 block text-sm text-muted-foreground">
                Email
                <input className={fieldClassName} type="email" name="email" placeholder="trader@example.com" required />
              </label>

              <label className="mt-4 block text-sm text-muted-foreground">
                Password
                <input
                  className={fieldClassName}
                  type="password"
                  name="password"
                  placeholder="Use at least 8 characters"
                  minLength={8}
                  required
                />
              </label>

              <Button className="mt-6 w-full">Create Account</Button>
            </form>
          </div>

          <Button variant="outline" className="mt-5 w-full" asChild>
            <Link href="/">Back to Landing</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
