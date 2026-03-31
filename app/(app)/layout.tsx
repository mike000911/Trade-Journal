import Link from "next/link";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/trades/new", label: "New Trade" },
  { href: "/weekly-review", label: "Weekly Review" }
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-wider text-muted-foreground">
            NASDAQ JOURNAL
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
