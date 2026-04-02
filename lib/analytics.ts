const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "currency"
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  notation: "compact",
  style: "currency"
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC"
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric"
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short"
});

const SESSION_LABELS = {
  AFTER_HOURS: "After Hours",
  MIDDAY: "Midday",
  OPEN: "Open",
  POWER_HOUR: "Power Hour",
  PREMARKET: "Premarket"
} as const;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Tone = "negative" | "neutral" | "positive";

export type AnalyticsMetric = {
  detail: string;
  label: string;
  progress: number;
  progressLabel: string;
  tone: Tone;
  value: string;
};

export type AnalyticsOverviewStat = {
  label: string;
  value: string;
};

export type AnalyticsTradeInput = {
  date: Date;
  direction: string;
  durationMinutes: number | null;
  emotion: string | null;
  entryTime: string | null;
  followedRules: boolean | null;
  heldProfitTarget: boolean | null;
  outcome: string | null;
  pnl: number;
  rMultiple: number | null;
  reachedTpAfterClose: boolean | null;
  respectedStop: boolean | null;
  session: keyof typeof SESSION_LABELS;
  setupType: string;
  symbol: string;
};

export type AnalyticsCurvePoint = {
  cumulativePnl: number;
  dateLabel: string;
  pnl: number;
  sequence: number;
  symbol: string;
};

export type AnalyticsDistributionBucket = {
  count: number;
  label: string;
  midpoint: number;
};

export type AnalyticsRadarPoint = {
  label: string;
  score: number;
};

export type AnalyticsHeatmapCell = {
  bucketLabel: string;
  intensity: number;
  totalPnl: number;
  tradeCount: number;
  tooltip: string;
};

export type AnalyticsHeatmapRow = {
  cells: AnalyticsHeatmapCell[];
  label: string;
};

export type AnalyticsScatterPoint = {
  label: string;
  meta: string;
  outcomeTone: Tone;
  x: number;
  y: number;
};

export type AnalyticsSessionPoint = {
  avgPnl: number;
  label: string;
  totalPnl: number;
  trades: number;
  winRate: number;
};

export type AnalyticsSetupPoint = {
  label: string;
  totalPnl: number;
  trades: number;
  winRate: number;
};

export type AnalyticsTableRow = {
  dateLabel: string;
  durationLabel: string;
  pnlLabel: string;
  sessionLabel: string;
  symbol: string;
  timeLabel: string;
  tone: Tone;
};

export type AnalyticsSnapshot = {
  cumulativeHighlights: AnalyticsOverviewStat[];
  cumulativePnl: AnalyticsCurvePoint[];
  distribution: AnalyticsDistributionBucket[];
  durationHighlights: AnalyticsOverviewStat[];
  durationPerformance: AnalyticsScatterPoint[];
  empty: boolean;
  heatmap: {
    columns: string[];
    rows: AnalyticsHeatmapRow[];
  };
  heatmapHighlights: AnalyticsOverviewStat[];
  metrics: AnalyticsMetric[];
  overview: AnalyticsOverviewStat[];
  recentTrades: AnalyticsTableRow[];
  score: {
    breakdown: AnalyticsRadarPoint[];
    caption: string;
    total: number;
  };
  sessionHighlights: AnalyticsOverviewStat[];
  sessionPerformance: AnalyticsSessionPoint[];
  setupHighlights: AnalyticsOverviewStat[];
  setupPerformance: AnalyticsSetupPoint[];
  timeHighlights: AnalyticsOverviewStat[];
  timePerformance: AnalyticsScatterPoint[];
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function average(values: number[]) {
  if (!values.length) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function averageNullable(values: Array<number | null>) {
  return average(values.filter((value): value is number => value !== null));
}

function toPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatSignedCurrency(value: number) {
  if (value > 0) {
    return `+${currencyFormatter.format(value)}`;
  }

  if (value < 0) {
    return `-${currencyFormatter.format(Math.abs(value))}`;
  }

  return currencyFormatter.format(0);
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatCompactCurrency(value: number) {
  if (value === 0) {
    return "$0";
  }

  if (value > 0) {
    return `+${compactCurrencyFormatter.format(value)}`;
  }

  return `-${compactCurrencyFormatter.format(Math.abs(value))}`;
}

function formatRangeCurrency(start: number, end: number) {
  return `${formatCompactCurrency(start)} to ${formatCompactCurrency(end)}`;
}

function formatTimeLabel(hour: number) {
  const roundedHour = Math.floor(hour);
  const minutes = Math.round((hour - roundedHour) * 60);

  return `${`${roundedHour}`.padStart(2, "0")}:${`${minutes}`.padStart(2, "0")}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!remainder) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
}

function formatSessionLabel(session: keyof typeof SESSION_LABELS) {
  return SESSION_LABELS[session] ?? session;
}

function parseEntryTime(entryTime: string | null) {
  if (!entryTime) {
    return null;
  }

  const [hoursText, minutesText] = entryTime.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText ?? "0");

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  return hours + minutes / 60;
}

function getToneFromPnl(value: number): Tone {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

function getToneFromScore(value: number | null): Tone {
  if (value === null) {
    return "neutral";
  }

  if (value >= 65) {
    return "positive";
  }

  if (value < 45) {
    return "negative";
  }

  return "neutral";
}

function buildHistogram(values: number[]) {
  if (!values.length) {
    return [] as AnalyticsDistributionBucket[];
  }

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  if (minimum === maximum) {
    return [
      {
        count: values.length,
        label: formatCompactCurrency(minimum),
        midpoint: minimum
      }
    ];
  }

  const bucketCount = clamp(Math.ceil(Math.sqrt(values.length)), 5, 9);
  const bucketSize = (maximum - minimum) / bucketCount;
  const counts = Array.from({ length: bucketCount }, () => 0);

  for (const value of values) {
    const rawIndex = Math.floor((value - minimum) / bucketSize);
    const bucketIndex = Math.min(bucketCount - 1, Math.max(0, rawIndex));
    counts[bucketIndex] += 1;
  }

  return counts.map((count, index) => {
    const bucketStart = minimum + bucketSize * index;
    const bucketEnd = index === bucketCount - 1 ? maximum : bucketStart + bucketSize;

    return {
      count,
      label: formatRangeCurrency(bucketStart, bucketEnd),
      midpoint: bucketStart + (bucketEnd - bucketStart) / 2
    };
  });
}

function getDurationBandLabel(durationMinutes: number | null) {
  if (durationMinutes === null) {
    return null;
  }

  if (durationMinutes < 15) {
    return "<15m";
  }

  if (durationMinutes < 45) {
    return "15-45m";
  }

  if (durationMinutes < 90) {
    return "45-90m";
  }

  return "90m+";
}

function trimLabel(value: string, maximumLength = 18) {
  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(0, maximumLength - 3)}...`;
}

function buildEmptySnapshot(journalDayCount: number): AnalyticsSnapshot {
  return {
    cumulativeHighlights: [
      { label: "Best trade", value: "Log data first" },
      { label: "Worst trade", value: "Log data first" },
      { label: "Average trade", value: "Log data first" }
    ],
    cumulativePnl: [],
    distribution: [],
    durationHighlights: [
      { label: "Avg duration", value: "No data" },
      { label: "Best duration band", value: "No data" },
      { label: "Logged durations", value: "0" }
    ],
    durationPerformance: [],
    empty: true,
    heatmap: {
      columns: Array.from({ length: 12 }, (_, index) => `${`${index * 2}`.padStart(2, "0")}`),
      rows: WEEKDAY_LABELS.map((label) => ({
        cells: Array.from({ length: 12 }, (_, index) => ({
          bucketLabel: `${`${index * 2}`.padStart(2, "0")}:00`,
          intensity: 0,
          totalPnl: 0,
          tradeCount: 0,
          tooltip: `${label} has no trades recorded yet.`
        })),
        label
      }))
    },
    heatmapHighlights: [
      { label: "Best timing", value: "Start logging entry time" },
      { label: "Weakest timing", value: "Start logging entry time" },
      { label: "Timed trades", value: "0" }
    ],
    metrics: [
      {
        detail: "Save trades from the calendar to begin building analytics.",
        label: "Net P&L",
        progress: 0,
        progressLabel: "0%",
        tone: "neutral",
        value: "$0"
      },
      {
        detail: "Winners and losers appear after the first completed trade.",
        label: "Trade Win Rate",
        progress: 0,
        progressLabel: "0%",
        tone: "neutral",
        value: "0%"
      },
      {
        detail: "Daily P&L needs at least one trading day.",
        label: "Day Win Rate",
        progress: 0,
        progressLabel: "0%",
        tone: "neutral",
        value: "0%"
      },
      {
        detail: "Track whether you followed the plan on each trade.",
        label: "Rule Adherence",
        progress: 15,
        progressLabel: "N/A",
        tone: "neutral",
        value: "Not logged"
      },
      {
        detail: "Profit factor compares gross profit against gross loss.",
        label: "Profit Factor",
        progress: 0,
        progressLabel: "0.0x",
        tone: "neutral",
        value: "0.00"
      },
      {
        detail: "Drawdown appears once the equity curve starts moving.",
        label: "Max Drawdown",
        progress: 0,
        progressLabel: "$0",
        tone: "neutral",
        value: "$0"
      }
    ],
    overview: [
      { label: "Trades", value: "0" },
      { label: "Trading days", value: "0" },
      { label: "Journal days", value: `${journalDayCount}` },
      { label: "Range", value: "No trades yet" }
    ],
    recentTrades: [],
    score: {
      breakdown: [
        { label: "Consistency", score: 0 },
        { label: "Discipline", score: 0 },
        { label: "Risk", score: 0 },
        { label: "Expectancy", score: 0 },
        { label: "Hold Quality", score: 0 }
      ],
      caption: "Log a few trades to unlock the scorecard.",
      total: 0
    },
    sessionHighlights: [
      { label: "Best session", value: "No data" },
      { label: "Busiest session", value: "No data" },
      { label: "Session leader", value: "No data" }
    ],
    sessionPerformance: [],
    setupHighlights: [
      { label: "Best setup", value: "No data" },
      { label: "Most used", value: "No data" },
      { label: "Win-rate leader", value: "No data" }
    ],
    setupPerformance: [],
    timeHighlights: [
      { label: "Earliest entry", value: "No data" },
      { label: "Latest entry", value: "No data" },
      { label: "Most active slot", value: "No data" }
    ],
    timePerformance: []
  };
}

export function buildAnalyticsSnapshot(
  trades: AnalyticsTradeInput[],
  journalDayCount: number
): AnalyticsSnapshot {
  if (!trades.length) {
    return buildEmptySnapshot(journalDayCount);
  }

  const sortedTrades = [...trades].sort((left, right) => left.date.getTime() - right.date.getTime());
  const pnls = sortedTrades.map((trade) => trade.pnl);
  const netPnl = pnls.reduce((total, value) => total + value, 0);
  const grossProfit = pnls.filter((value) => value > 0).reduce((total, value) => total + value, 0);
  const grossLoss = Math.abs(pnls.filter((value) => value < 0).reduce((total, value) => total + value, 0));
  const winningTrades = pnls.filter((value) => value > 0).length;
  const losingTrades = pnls.filter((value) => value < 0).length;
  const scratchTrades = sortedTrades.length - winningTrades - losingTrades;
  const winRate = (winningTrades / sortedTrades.length) * 100;
  const finiteProfitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
  const profitFactor = grossLoss > 0 ? finiteProfitFactor : grossProfit > 0 ? null : 0;
  const profitFactorScore = grossLoss > 0 ? clamp((finiteProfitFactor / 3) * 100, 0, 100) : grossProfit > 0 ? 100 : 0;

  const dailyTotals = new Map<string, number>();
  const sessionMap = new Map<string, { totalPnl: number; trades: number; wins: number }>();
  const setupMap = new Map<string, { totalPnl: number; trades: number; wins: number }>();
  const hourlyHeatmap = new Map<string, { totalPnl: number; tradeCount: number }>();
  const timeSlotMap = new Map<string, { count: number; slotLabel: string; totalPnl: number }>();
  const durationBandMap = new Map<string, { count: number; totalPnl: number }>();
  let runningTotal = 0;
  let peak = 0;
  let peakIndex = 0;
  let maxDrawdown = 0;
  let longestRecovery = 0;
  let currentlyRecovering = false;
  let recoveryStartIndex = 0;

  const cumulativePnl = sortedTrades.map((trade, index) => {
    runningTotal += trade.pnl;

    if (runningTotal >= peak) {
      if (currentlyRecovering) {
        longestRecovery = Math.max(longestRecovery, index - recoveryStartIndex);
      }

      peak = runningTotal;
      peakIndex = index;
      currentlyRecovering = false;
    } else {
      if (!currentlyRecovering) {
        recoveryStartIndex = peakIndex;
      }

      currentlyRecovering = true;
      maxDrawdown = Math.max(maxDrawdown, peak - runningTotal);
    }

    const dateKey = trade.date.toISOString().slice(0, 10);
    dailyTotals.set(dateKey, (dailyTotals.get(dateKey) ?? 0) + trade.pnl);

    const sessionSummary = sessionMap.get(trade.session) ?? { totalPnl: 0, trades: 0, wins: 0 };
    sessionSummary.totalPnl += trade.pnl;
    sessionSummary.trades += 1;
    sessionSummary.wins += trade.pnl > 0 ? 1 : 0;
    sessionMap.set(trade.session, sessionSummary);

    const setupLabel = trade.setupType.trim() || "Unlabeled";
    const setupSummary = setupMap.get(setupLabel) ?? { totalPnl: 0, trades: 0, wins: 0 };
    setupSummary.totalPnl += trade.pnl;
    setupSummary.trades += 1;
    setupSummary.wins += trade.pnl > 0 ? 1 : 0;
    setupMap.set(setupLabel, setupSummary);

    const parsedTime = parseEntryTime(trade.entryTime);

    if (parsedTime !== null) {
      const timeBucketIndex = Math.min(11, Math.max(0, Math.floor(parsedTime / 2)));
      const bucketHour = timeBucketIndex * 2;
      const weekdayIndex = trade.date.getUTCDay();
      const heatmapKey = `${weekdayIndex}-${timeBucketIndex}`;
      const heatmapSummary = hourlyHeatmap.get(heatmapKey) ?? { totalPnl: 0, tradeCount: 0 };
      heatmapSummary.totalPnl += trade.pnl;
      heatmapSummary.tradeCount += 1;
      hourlyHeatmap.set(heatmapKey, heatmapSummary);

      const slotKey = `${bucketHour}`;
      const timeSlotSummary = timeSlotMap.get(slotKey) ?? {
        count: 0,
        slotLabel: `${`${bucketHour}`.padStart(2, "0")}:00-${`${bucketHour + 2}`.padStart(2, "0")}:00`,
        totalPnl: 0
      };
      timeSlotSummary.count += 1;
      timeSlotSummary.totalPnl += trade.pnl;
      timeSlotMap.set(slotKey, timeSlotSummary);
    }

    const durationBand = getDurationBandLabel(trade.durationMinutes);

    if (durationBand) {
      const durationSummary = durationBandMap.get(durationBand) ?? { count: 0, totalPnl: 0 };
      durationSummary.count += 1;
      durationSummary.totalPnl += trade.pnl;
      durationBandMap.set(durationBand, durationSummary);
    }

    return {
      cumulativePnl: Number(runningTotal.toFixed(2)),
      dateLabel: longDateFormatter.format(trade.date),
      pnl: trade.pnl,
      sequence: index + 1,
      symbol: trade.symbol
    } satisfies AnalyticsCurvePoint;
  });

  if (currentlyRecovering) {
    longestRecovery = Math.max(longestRecovery, sortedTrades.length - 1 - recoveryStartIndex);
  }

  const tradingDays = dailyTotals.size;
  const winningDays = [...dailyTotals.values()].filter((value) => value > 0).length;
  const dayWinRate = tradingDays ? (winningDays / tradingDays) * 100 : 0;

  const followedRuleEntries = sortedTrades.filter((trade) => trade.followedRules !== null);
  const heldTargetEntries = sortedTrades.filter((trade) => trade.heldProfitTarget !== null);
  const respectedStopEntries = sortedTrades.filter((trade) => trade.respectedStop !== null);
  const manualCloseEntries = sortedTrades.filter((trade) => trade.reachedTpAfterClose !== null);
  const followedRulesRate = followedRuleEntries.length
    ? (followedRuleEntries.filter((trade) => trade.followedRules).length / followedRuleEntries.length) * 100
    : null;
  const heldTargetRate = heldTargetEntries.length
    ? (heldTargetEntries.filter((trade) => trade.heldProfitTarget).length / heldTargetEntries.length) * 100
    : null;
  const respectedStopRate = respectedStopEntries.length
    ? (respectedStopEntries.filter((trade) => trade.respectedStop).length / respectedStopEntries.length) * 100
    : null;
  const missedTargetRate = manualCloseEntries.length
    ? (manualCloseEntries.filter((trade) => trade.reachedTpAfterClose).length / manualCloseEntries.length) * 100
    : null;
  const averageRMultiple = average(
    sortedTrades
      .map((trade) => trade.rMultiple)
      .filter((value): value is number => value !== null)
  );

  const drawdownRatio = maxDrawdown / Math.max(grossProfit, 1);
  const consistencyScore = clamp(
    dayWinRate * 0.45 + (100 - clamp(drawdownRatio * 120, 0, 100)) * 0.35 + clamp(sortedTrades.length * 4, 0, 100) * 0.2,
    0,
    100
  );
  const disciplineScore = clamp(
    averageNullable([followedRulesRate, respectedStopRate, heldTargetRate]) ?? 55,
    0,
    100
  );
  const riskScore = clamp(
    (respectedStopRate ?? 55) * 0.55 + (100 - clamp(drawdownRatio * 160, 0, 100)) * 0.45,
    0,
    100
  );
  const avgRScore =
    averageRMultiple === null ? 50 : clamp(((averageRMultiple + 1) / 2.5) * 100, 0, 100);
  const expectancyScore = clamp(profitFactorScore * 0.5 + avgRScore * 0.3 + winRate * 0.2, 0, 100);
  const holdQualityScore = clamp(
    (heldTargetRate ?? 55) * 0.5 + (missedTargetRate === null ? 55 : 100 - missedTargetRate) * 0.5,
    0,
    100
  );

  const scoreBreakdown = [
    { label: "Consistency", score: Math.round(consistencyScore) },
    { label: "Discipline", score: Math.round(disciplineScore) },
    { label: "Risk", score: Math.round(riskScore) },
    { label: "Expectancy", score: Math.round(expectancyScore) },
    { label: "Hold Quality", score: Math.round(holdQualityScore) }
  ] satisfies AnalyticsRadarPoint[];

  const strongestDimension = [...scoreBreakdown].sort((left, right) => right.score - left.score)[0];
  const weakestDimension = [...scoreBreakdown].sort((left, right) => left.score - right.score)[0];
  const totalScore = Math.round(average(scoreBreakdown.map((item) => item.score)) ?? 0);

  const distribution = buildHistogram(pnls);

  const columns = Array.from({ length: 12 }, (_, index) => `${`${index * 2}`.padStart(2, "0")}`);
  const maxHeatmapMagnitude = Math.max(
    1,
    ...[...hourlyHeatmap.values()].map((item) => Math.abs(item.totalPnl))
  );

  const heatmapRows = WEEKDAY_LABELS.map((label, weekdayIndex) => ({
    cells: columns.map((column, bucketIndex) => {
      const heatmapSummary = hourlyHeatmap.get(`${weekdayIndex}-${bucketIndex}`) ?? {
        totalPnl: 0,
        tradeCount: 0
      };
      const startHour = bucketIndex * 2;
      const endHour = startHour + 2;

      return {
        bucketLabel: `${column}:00`,
        intensity: heatmapSummary.tradeCount ? Math.abs(heatmapSummary.totalPnl) / maxHeatmapMagnitude : 0,
        totalPnl: heatmapSummary.totalPnl,
        tradeCount: heatmapSummary.tradeCount,
        tooltip: `${label} ${`${startHour}`.padStart(2, "0")}:00-${`${endHour}`.padStart(2, "0")}:00 - ${heatmapSummary.tradeCount} trade${heatmapSummary.tradeCount === 1 ? "" : "s"} - ${formatSignedCurrency(heatmapSummary.totalPnl)}`
      };
    }),
    label
  })) satisfies AnalyticsHeatmapRow[];

  const bestHeatmapCell = [...hourlyHeatmap.entries()].sort((left, right) => right[1].totalPnl - left[1].totalPnl)[0];
  const worstHeatmapCell = [...hourlyHeatmap.entries()].sort((left, right) => left[1].totalPnl - right[1].totalPnl)[0];

  const formatHeatmapCellLabel = (entry?: [string, { totalPnl: number; tradeCount: number }]) => {
    if (!entry) {
      return "No timed trades";
    }

    const [compositeKey, value] = entry;
    const [weekdayIndexText, bucketIndexText] = compositeKey.split("-");
    const weekdayIndex = Number(weekdayIndexText);
    const bucketIndex = Number(bucketIndexText);
    const hour = bucketIndex * 2;

    return `${WEEKDAY_LABELS[weekdayIndex]} ${`${hour}`.padStart(2, "0")}:00 (${formatSignedCurrency(value.totalPnl)})`;
  };

  const sessionPerformance = [...sessionMap.entries()]
    .map(([session, summary]) => ({
      avgPnl: Number((summary.totalPnl / summary.trades).toFixed(2)),
      label: formatSessionLabel(session as keyof typeof SESSION_LABELS),
      totalPnl: Number(summary.totalPnl.toFixed(2)),
      trades: summary.trades,
      winRate: Number(((summary.wins / summary.trades) * 100).toFixed(1))
    }))
    .sort((left, right) => right.totalPnl - left.totalPnl);

  const setupPerformance = [...setupMap.entries()]
    .map(([setupType, summary]) => ({
      label: trimLabel(setupType),
      totalPnl: Number(summary.totalPnl.toFixed(2)),
      trades: summary.trades,
      winRate: Number(((summary.wins / summary.trades) * 100).toFixed(1))
    }))
    .sort((left, right) => right.totalPnl - left.totalPnl)
    .slice(0, 6);

  const timePerformance = sortedTrades
    .map((trade) => {
      const parsedTime = parseEntryTime(trade.entryTime);

      if (parsedTime === null) {
        return null;
      }

      return {
        label: `${trade.symbol} - ${trade.entryTime ?? "--"}`,
        meta: longDateFormatter.format(trade.date),
        outcomeTone: getToneFromPnl(trade.pnl),
        x: Number(parsedTime.toFixed(2)),
        y: trade.pnl
      } satisfies AnalyticsScatterPoint;
    })
    .filter((value): value is AnalyticsScatterPoint => value !== null);

  const durationPerformance = sortedTrades
    .map((trade) => {
      if (trade.durationMinutes === null) {
        return null;
      }

      return {
        label: `${trade.symbol} - ${formatDuration(trade.durationMinutes)}`,
        meta: longDateFormatter.format(trade.date),
        outcomeTone: getToneFromPnl(trade.pnl),
        x: trade.durationMinutes,
        y: trade.pnl
      } satisfies AnalyticsScatterPoint;
    })
    .filter((value): value is AnalyticsScatterPoint => value !== null);

  const timeSlots = [...timeSlotMap.values()];
  const mostActiveSlot = [...timeSlots].sort((left, right) => right.count - left.count)[0];
  const durationBands = [...durationBandMap.entries()].map(([label, value]) => ({
    label,
    ...value
  }));
  const bestDurationBand = [...durationBands].sort((left, right) => right.totalPnl - left.totalPnl)[0];
  const recentTrades = [...sortedTrades]
    .reverse()
    .slice(0, 8)
    .map((trade) => ({
      dateLabel: `${weekdayFormatter.format(trade.date)} ${shortDateFormatter.format(trade.date)}`,
      durationLabel: trade.durationMinutes === null ? "--" : formatDuration(trade.durationMinutes),
      pnlLabel: formatSignedCurrency(trade.pnl),
      sessionLabel: formatSessionLabel(trade.session),
      symbol: trade.symbol,
      timeLabel: trade.entryTime ?? "--",
      tone: getToneFromPnl(trade.pnl)
    }));

  const bestTrade = [...sortedTrades].sort((left, right) => right.pnl - left.pnl)[0];
  const worstTrade = [...sortedTrades].sort((left, right) => left.pnl - right.pnl)[0];
  const averageTrade = netPnl / sortedTrades.length;
  const firstTrade = sortedTrades[0];
  const lastTrade = sortedTrades[sortedTrades.length - 1];
  const longestTrade = [...sortedTrades]
    .filter((trade) => trade.durationMinutes !== null)
    .sort((left, right) => (right.durationMinutes ?? 0) - (left.durationMinutes ?? 0))[0];
  const earliestTimedTrade = [...timePerformance].sort((left, right) => left.x - right.x)[0];
  const latestTimedTrade = [...timePerformance].sort((left, right) => right.x - left.x)[0];
  const setupLeader = setupPerformance[0];
  const mostUsedSetup = [...setupPerformance].sort((left, right) => right.trades - left.trades)[0];
  const setupWinRateLeader = [...setupPerformance].sort((left, right) => right.winRate - left.winRate)[0];
  const sessionLeader = sessionPerformance[0];
  const busiestSession = [...sessionPerformance].sort((left, right) => right.trades - left.trades)[0];
  const bestSessionWinRate = [...sessionPerformance].sort((left, right) => right.winRate - left.winRate)[0];

  const averageDuration = average(
    sortedTrades
      .map((trade) => trade.durationMinutes)
      .filter((value): value is number => value !== null)
  );

  return {
    cumulativeHighlights: [
      { label: "Best trade", value: bestTrade ? `${bestTrade.symbol} ${formatSignedCurrency(bestTrade.pnl)}` : "No data" },
      { label: "Worst trade", value: worstTrade ? `${worstTrade.symbol} ${formatSignedCurrency(worstTrade.pnl)}` : "No data" },
      { label: "Average trade", value: formatSignedCurrency(averageTrade) }
    ],
    cumulativePnl,
    distribution,
    durationHighlights: [
      {
        label: "Avg duration",
        value: averageDuration === null ? "Not logged" : formatDuration(Math.round(averageDuration))
      },
      {
        label: "Best duration band",
        value: bestDurationBand ? `${bestDurationBand.label} (${formatSignedCurrency(bestDurationBand.totalPnl)})` : "No data"
      },
      {
        label: "Longest hold",
        value: longestTrade?.durationMinutes ? formatDuration(longestTrade.durationMinutes) : "Not logged"
      }
    ],
    durationPerformance,
    empty: false,
    heatmap: {
      columns,
      rows: heatmapRows
    },
    heatmapHighlights: [
      { label: "Best timing", value: formatHeatmapCellLabel(bestHeatmapCell) },
      { label: "Weakest timing", value: formatHeatmapCellLabel(worstHeatmapCell) },
      { label: "Timed trades", value: `${timePerformance.length}` }
    ],
    metrics: [
      {
        detail: `${formatSignedCurrency(averageTrade)} average per trade across ${sortedTrades.length} positions.`,
        label: "Net P&L",
        progress: clamp((profitFactorScore + winRate) / 2, 0, 100),
        progressLabel: toPercent(winRate),
        tone: getToneFromPnl(netPnl),
        value: formatSignedCurrency(netPnl)
      },
      {
        detail: `${winningTrades} winners - ${losingTrades} losers - ${scratchTrades} flat trades.`,
        label: "Trade Win Rate",
        progress: winRate,
        progressLabel: toPercent(winRate),
        tone: getToneFromScore(winRate),
        value: toPercent(winRate)
      },
      {
        detail: `${winningDays} profitable days out of ${tradingDays} active days.`,
        label: "Day Win Rate",
        progress: dayWinRate,
        progressLabel: toPercent(dayWinRate),
        tone: getToneFromScore(dayWinRate),
        value: toPercent(dayWinRate)
      },
      {
        detail:
          followedRulesRate === null
            ? "Start marking rule-following on each trade for process feedback."
            : `${followedRuleEntries.length} trades were scored for discipline.`,
        label: "Rule Adherence",
        progress: followedRulesRate ?? 15,
        progressLabel: followedRulesRate === null ? "N/A" : toPercent(followedRulesRate),
        tone: getToneFromScore(followedRulesRate),
        value: followedRulesRate === null ? "Not logged" : toPercent(followedRulesRate)
      },
      {
        detail:
          grossLoss > 0
            ? `${formatCurrency(grossProfit)} gross profit against ${formatCurrency(grossLoss)} gross loss.`
            : "No losing trades recorded in the selected history.",
        label: "Profit Factor",
        progress: profitFactorScore,
        progressLabel: grossLoss > 0 ? `${profitFactor?.toFixed(1)}x` : "Perfect",
        tone: getToneFromScore(profitFactorScore),
        value: grossLoss > 0 ? profitFactor!.toFixed(2) : "INF"
      },
      {
        detail: `${longestRecovery} trade${longestRecovery === 1 ? "" : "s"} needed to recover from the deepest dip.`,
        label: "Max Drawdown",
        progress: clamp(100 - drawdownRatio * 100, 0, 100),
        progressLabel: formatCompactCurrency(-maxDrawdown),
        tone: maxDrawdown === 0 ? "positive" : maxDrawdown > Math.max(grossProfit * 0.4, 1) ? "negative" : "neutral",
        value: maxDrawdown ? formatSignedCurrency(-maxDrawdown) : "$0"
      }
    ],
    overview: [
      { label: "Trades", value: `${sortedTrades.length}` },
      { label: "Trading days", value: `${tradingDays}` },
      { label: "Journal days", value: `${journalDayCount}` },
      { label: "Range", value: `${shortDateFormatter.format(firstTrade.date)} - ${longDateFormatter.format(lastTrade.date)}` }
    ],
    recentTrades,
    score: {
      breakdown: scoreBreakdown,
      caption: `${strongestDimension.label} is strongest right now, while ${weakestDimension.label.toLowerCase()} has the most room to improve.`,
      total: totalScore
    },
    sessionHighlights: [
      {
        label: "Best session",
        value: sessionLeader ? `${sessionLeader.label} (${formatSignedCurrency(sessionLeader.totalPnl)})` : "No data"
      },
      {
        label: "Busiest session",
        value: busiestSession ? `${busiestSession.label} (${busiestSession.trades} trades)` : "No data"
      },
      {
        label: "Session leader",
        value: bestSessionWinRate ? `${bestSessionWinRate.label} (${Math.round(bestSessionWinRate.winRate)}% win rate)` : "No data"
      }
    ],
    sessionPerformance,
    setupHighlights: [
      {
        label: "Best setup",
        value: setupLeader ? `${setupLeader.label} (${formatSignedCurrency(setupLeader.totalPnl)})` : "No data"
      },
      {
        label: "Most used",
        value: mostUsedSetup ? `${mostUsedSetup.label} (${mostUsedSetup.trades} trades)` : "No data"
      },
      {
        label: "Win-rate leader",
        value: setupWinRateLeader ? `${setupWinRateLeader.label} (${Math.round(setupWinRateLeader.winRate)}%)` : "No data"
      }
    ],
    setupPerformance,
    timeHighlights: [
      { label: "Earliest entry", value: earliestTimedTrade ? formatTimeLabel(earliestTimedTrade.x) : "No data" },
      { label: "Latest entry", value: latestTimedTrade ? formatTimeLabel(latestTimedTrade.x) : "No data" },
      { label: "Most active slot", value: mostActiveSlot ? mostActiveSlot.slotLabel : "No data" }
    ],
    timePerformance
  };
}
