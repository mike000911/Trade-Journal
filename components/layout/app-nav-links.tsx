"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/calendar", label: "Calendar" },
  { href: "/trades/new", label: "New Trade" },
  { href: "/weekly-review", label: "Weekly Review" }
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full border border-transparent px-3 py-2 transition",
            isActive(pathname, item.href)
              ? "border-primary/35 bg-primary/10 text-foreground"
              : "hover:border-border/80 hover:bg-card/60 hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
