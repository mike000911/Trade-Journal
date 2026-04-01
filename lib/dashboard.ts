import { addMonths, formatMonthLabel, getCalendarDates, getDateKey, getMonthKey } from "@/lib/date";

type TradeLike = {
  date: Date;
  outcome: string | null;
};

type JournalDayLike = {
  date: Date;
  trades: Array<unknown>;
};

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type EquityPoint = {
  label: string;
  equity: number;
};

export type CalendarCell = {
  dateKey: string;
  dayNumber: number;
  tradeCount: number;
  hasJournal: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
};

export function buildDashboardMetrics(trades: TradeLike[], journalDayCount: number): DashboardMetric[] {
  if (!trades.length) {
    return [
      { label: "Trades Logged", value: "0", detail: "Start by clicking a day on the calendar." },
      { label: "TP Hits", value: "0", detail: "No take-profit results saved yet." },
      { label: "Stop Outs", value: "0", detail: "No stopped trades logged yet." },
      { label: "Journal Days", value: `${journalDayCount}`, detail: "Track daily plans and emotional state." }
    ];
  }

  const takeProfitHits = trades.filter((trade) => trade.outcome === "TAKE_PROFIT_HIT").length;
  const stopLossHits = trades.filter((trade) => trade.outcome === "STOP_LOSS_HIT").length;
  const manualCloses = trades.filter((trade) => trade.outcome === "MANUAL_CLOSE").length;

  return [
    {
      label: "Trades Logged",
      value: `${trades.length}`,
      detail: `${journalDayCount} calendar day${journalDayCount === 1 ? "" : "s"} with notes`
    },
    {
      label: "TP Hits",
      value: `${takeProfitHits}`,
      detail: "Trades that reached the planned take profit"
    },
    {
      label: "Stop Outs",
      value: `${stopLossHits}`,
      detail: "Trades that ended at the stop"
    },
    {
      label: "Manual Closures",
      value: `${manualCloses}`,
      detail: "Trades closed by discretion before TP or SL"
    }
  ];
}

export function buildEquityCurveData(trades: TradeLike[]): EquityPoint[] {
  if (!trades.length) {
    return [];
  }

  const weeklyTotals = new Map<string, number>();

  for (const trade of [...trades].sort((left, right) => left.date.getTime() - right.date.getTime())) {
    const weekStart = new Date(trade.date);
    const weekday = weekStart.getUTCDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    weekStart.setUTCDate(weekStart.getUTCDate() + mondayOffset);
    const weekKey = getDateKey(weekStart);

    weeklyTotals.set(weekKey, (weeklyTotals.get(weekKey) ?? 0) + 1);
  }

  let runningTotal = 0;

  return Array.from(weeklyTotals.entries()).map(([weekKey, weeklyTradeCount]) => {
    runningTotal += weeklyTradeCount;

    return {
      label: weekKey.slice(5),
      equity: Number(runningTotal.toFixed(0))
    };
  });
}

export function buildCalendarCells(
  monthKey: string,
  journalDays: JournalDayLike[],
  selectedDateKey?: string
) {
  const todayKey = getDateKey(new Date());
  const summaryByDate = new Map(
    journalDays.map((journalDay) => {
      const dateKey = getDateKey(journalDay.date);
      const tradeCount = journalDay.trades.length;

      return [
        dateKey,
        {
          hasJournal: true,
          tradeCount
        }
      ] as const;
    })
  );

  return {
    days: getCalendarDates(monthKey).map((date) => {
      const dateKey = getDateKey(date);
      const summary = summaryByDate.get(dateKey);

      return {
        dateKey,
        dayNumber: date.getUTCDate(),
        tradeCount: summary?.tradeCount ?? 0,
        hasJournal: summary?.hasJournal ?? false,
        isCurrentMonth: getMonthKey(date) === monthKey,
        isSelected: selectedDateKey === dateKey,
        isToday: todayKey === dateKey
      } satisfies CalendarCell;
    }),
    monthLabel: formatMonthLabel(monthKey),
    nextMonthKey: addMonths(monthKey, 1),
    previousMonthKey: addMonths(monthKey, -1)
  };
}
