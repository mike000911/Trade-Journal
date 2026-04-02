import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { AppNavLinks } from "@/components/layout/app-nav-links";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="container flex min-h-16 flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-semibold tracking-wider text-muted-foreground transition hover:text-foreground">
              NASDAQ JOURNAL
            </Link>
            <div className="hidden h-6 w-px bg-border/70 md:block" />
            <div className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user.displayName ?? user.email}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <AppNavLinks />

            <form action={signOutAction}>
              <Button variant="outline" className="w-full md:w-auto">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
