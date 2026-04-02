import Link from "next/link";
import { deleteTradeAction } from "@/app/actions/journal";
import { JournalDayForm } from "@/components/calendar/journal-day-form";
import { TradeEntryForm } from "@/components/forms/trade-entry-form";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { buildCalendarCells } from "@/lib/dashboard";
import {
  ensureDateKey,
  ensureMonthKey,
  formatDisplayDate,
  formatMonthLabel,
  getDateKey,
  getMonthBounds,
  getSingleSearchParam,
  parseDateKey
} from "@/lib/date";
import { prisma } from "@/lib/prisma";

type CalendarPageProps = {
  searchParams?: Promise<{
    date?: string | string[];
    error?: string | string[];
    message?: string | string[];
    month?: string | string[];
  }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const todayKey = getDateKey(new Date());
  const dateKey = ensureDateKey(getSingleSearchParam(params.date), todayKey);
  const monthKey = ensureMonthKey(getSingleSearchParam(params.month), dateKey.slice(0, 7));
  const selectedDate = parseDateKey(dateKey);
  const error = getSingleSearchParam(params.error);
  const message = getSingleSearchParam(params.message);
  const { start, end } = getMonthBounds(monthKey);

  if (!selectedDate) {
    throw new Error("Invalid selected date.");
  }

  const [monthJournalDays, selectedJournalDay] = await Promise.all([
    prisma.journalDay.findMany({
      where: {
        userId: user.id,
        date: {
          gte: start,
          lt: end
        }
      },
      orderBy: {
        date: "asc"
      },
      select: {
        date: true,
        trades: {
          select: {
            id: true
          }
        }
      }
    }),
    prisma.journalDay.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: selectedDate
        }
      },
      include: {
        trades: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })
  ]);

  const calendar = buildCalendarCells(monthKey, monthJournalDays, dateKey);

  return (
    <main className="min-h-screen bg-background px-4 py-10 md:px-10">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Calendar Journal</p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{formatMonthLabel(monthKey)}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Click a day to log the pre-game plan, emotional state, and manual trades for that session.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href={`/calendar?month=${monthKey}&date=${todayKey}`}>Jump to Today</Link>
            </Button>
          </div>
        </header>

        {(error || message) && (
          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-red-500/30 bg-red-500/10 text-red-100"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {error ?? message}
          </div>
        )}

        <section className="glass mt-6 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <Link href={`/calendar?month=${calendar.previousMonthKey}&date=${dateKey}`} className="text-sm text-muted-foreground transition hover:text-foreground">
              Previous Month
            </Link>
            <div className="text-center">
              <h2 className="text-lg font-medium">{calendar.monthLabel}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{formatDisplayDate(dateKey)}</p>
            </div>
            <Link href={`/calendar?month=${calendar.nextMonthKey}&date=${dateKey}`} className="text-sm text-muted-foreground transition hover:text-foreground">
              Next Month
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {calendar.days.map((day) => (
              <Link
                key={day.dateKey}
                href={`/calendar?month=${monthKey}&date=${day.dateKey}`}
                className={`rounded-2xl border p-3 transition ${
                  day.isSelected
                    ? "border-primary bg-primary/10"
                    : day.isCurrentMonth
                      ? "border-border/70 bg-card/40 hover:border-primary/40 hover:bg-card/70"
                      : "border-border/40 bg-card/10 text-muted-foreground/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${day.isToday ? "text-primary" : ""}`}>{day.dayNumber}</span>
                  {day.hasJournal ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                </div>
                <p className="mt-5 text-xs text-muted-foreground">{day.tradeCount} trade{day.tradeCount === 1 ? "" : "s"}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-6">
          <section className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Selected day</p>
            <h2 className="mt-3 text-2xl font-semibold">{formatDisplayDate(dateKey)}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Use this page like a trading desk notebook: build the session plan first, then log each executed trade below it.
            </p>
          </section>

          <JournalDayForm
            dateKey={dateKey}
            dateLabel={formatDisplayDate(dateKey)}
            monthKey={monthKey}
            values={
              selectedJournalDay
                ? {
                    analysis: selectedJournalDay.analysis,
                    dailyEmotion: selectedJournalDay.dailyEmotion,
                    keyLevels: selectedJournalDay.keyLevels,
                    notes: selectedJournalDay.notes,
                    preGamePlan: selectedJournalDay.preGamePlan
                  }
                : null
            }
          />

          <TradeEntryForm dateKey={dateKey} monthKey={monthKey} />
        </section>

        <section className="glass mt-6 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium">Saved Trades for {formatDisplayDate(dateKey)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Review setup details, stop management, and the final outcome for each trade on this day.
              </p>
            </div>
          </div>

          {selectedJournalDay?.trades.length ? (
            <div className="mt-6 grid gap-4">
              {selectedJournalDay.trades.map((trade) => (
                <article key={trade.id} className="rounded-2xl border border-border/70 bg-card/35 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold">{trade.symbol}</h3>
                        <span className="rounded-full border border-border/70 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          {trade.direction}
                        </span>
                        {trade.entryTime ? (
                          <span className="rounded-full border border-border/70 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            {trade.entryTime}
                          </span>
                        ) : null}
                        <span className="rounded-full border border-border/70 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          {trade.session.replaceAll("_", " ")}
                        </span>
                      </div>

                      <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                        <p>Entry: <span className="text-foreground">{trade.entry.toString()}</span></p>
                        <p>Strategy: <span className="text-foreground">{trade.setupType}</span></p>
                        <p>Outcome: <span className="text-foreground">{trade.outcome?.replaceAll("_", " ") ?? "Not set"}</span></p>
                        <p>Take Profit: <span className="text-foreground">{trade.takeProfit?.toString() ?? "None"}</span></p>
                        <p>Initial Stop: <span className="text-foreground">{trade.stopLoss?.toString() ?? "None"}</span></p>
                        <p>Moved Stop: <span className="text-foreground">{trade.movedStopLoss?.toString() ?? "Not moved"}</span></p>
                        <p>Duration: <span className="text-foreground">{trade.durationMinutes ? `${trade.durationMinutes} min` : "Not logged"}</span></p>
                        <p>Rules Followed: <span className="text-foreground">{trade.followedRules === null ? "Not logged" : trade.followedRules ? "Yes" : "No"}</span></p>
                        <p>Held Profit Target: <span className="text-foreground">{trade.heldProfitTarget === null ? "Not logged" : trade.heldProfitTarget ? "Yes" : "No"}</span></p>
                        <p>Respected Stop: <span className="text-foreground">{trade.respectedStop === null ? "Not logged" : trade.respectedStop ? "Yes" : "No"}</span></p>
                        <p>Emotion: <span className="text-foreground">{trade.emotion ?? "Not logged"}</span></p>
                        <p>
                          Reached TP after manual close:
                          <span className="text-foreground"> {trade.reachedTpAfterClose === null ? "N/A" : trade.reachedTpAfterClose ? "Yes" : "No"}</span>
                        </p>
                      </div>

                      {trade.stopMoveReason ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground">Stop move reason:</span> {trade.stopMoveReason}
                        </p>
                      ) : null}

                      {trade.resultNotes ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground">Result notes:</span> {trade.resultNotes}
                        </p>
                      ) : null}
                    </div>

                    <form action={deleteTradeAction}>
                      <input type="hidden" name="tradeId" value={trade.id} />
                      <input type="hidden" name="date" value={dateKey} />
                      <input type="hidden" name="month" value={monthKey} />
                      <Button variant="outline">Delete Trade</Button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card/20 p-8 text-sm text-muted-foreground">
              No trades saved for this day yet. Fill in the trade form above and the entry will appear here.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
