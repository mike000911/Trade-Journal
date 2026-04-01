import Link from "next/link";
import type { CalendarCell } from "@/lib/dashboard";

interface TradeCalendarCardProps {
  days: CalendarCell[];
  monthKey: string;
  monthLabel: string;
  nextMonthKey: string;
  previousMonthKey: string;
}

export function TradeCalendarCard({
  days,
  monthKey,
  monthLabel,
  nextMonthKey,
  previousMonthKey
}: TradeCalendarCardProps) {
  return (
    <article className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Trade Calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Click a day to enter plans, emotions, and trades.</p>
        </div>
        <Link href={`/calendar?month=${monthKey}`} className="text-sm text-primary transition hover:text-foreground">
          Open full calendar
        </Link>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
        <Link href={`/calendar?month=${previousMonthKey}`} className="transition hover:text-foreground">
          Previous
        </Link>
        <p className="font-medium text-foreground">{monthLabel}</p>
        <Link href={`/calendar?month=${nextMonthKey}`} className="transition hover:text-foreground">
          Next
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {days.map((day) => (
          <Link
            key={day.dateKey}
            href={`/calendar?month=${monthKey}&date=${day.dateKey}`}
            className={`rounded-2xl border p-2 text-left transition ${
              day.isSelected
                ? "border-primary bg-primary/10"
                : day.isCurrentMonth
                  ? "border-border/70 bg-card/40 hover:border-primary/40 hover:bg-card/70"
                  : "border-border/40 bg-card/10 text-muted-foreground/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${day.isToday ? "text-primary" : ""}`}>{day.dayNumber}</span>
              {day.hasJournal ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{day.tradeCount} trade{day.tradeCount === 1 ? "" : "s"}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
