const MONTH_NAMES = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC"
});

const DISPLAY_DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});

export function getDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getMonthKey(date: Date) {
  return getDateKey(date).slice(0, 7);
}

export function parseDateKey(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseMonthKey(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1, 12));

  return Number.isNaN(date.getTime()) ? null : date;
}

export function ensureDateKey(value?: string | null, fallback = getDateKey(new Date())) {
  return parseDateKey(value) ? value! : fallback;
}

export function ensureMonthKey(value?: string | null, fallback = getMonthKey(new Date())) {
  return parseMonthKey(value) ? value! : fallback;
}

export function getMonthBounds(monthKey: string) {
  const monthDate = parseMonthKey(monthKey);

  if (!monthDate) {
    throw new Error(`Invalid month key: ${monthKey}`);
  }

  const start = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1));
  const end = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1));

  return { start, end };
}

export function addMonths(monthKey: string, offset: number) {
  const monthDate = parseMonthKey(monthKey);

  if (!monthDate) {
    throw new Error(`Invalid month key: ${monthKey}`);
  }

  return getMonthKey(
    new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + offset, 1, 12))
  );
}

export function formatMonthLabel(monthKey: string) {
  const monthDate = parseMonthKey(monthKey);

  if (!monthDate) {
    return monthKey;
  }

  return MONTH_NAMES.format(monthDate);
}

export function formatDisplayDate(value: Date | string) {
  const date = typeof value === "string" ? parseDateKey(value) : value;

  if (!date) {
    return typeof value === "string" ? value : "";
  }

  return DISPLAY_DATE.format(date);
}

export function getCalendarDates(monthKey: string) {
  const monthDate = parseMonthKey(monthKey);

  if (!monthDate) {
    throw new Error(`Invalid month key: ${monthKey}`);
  }

  const firstDayOfMonth = new Date(
    Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1, 12)
  );
  const firstWeekday = firstDayOfMonth.getUTCDay();
  const gridStart = new Date(
    Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1 - firstWeekday, 12)
  );

  return Array.from({ length: 42 }, (_, index) => {
    return new Date(
      Date.UTC(gridStart.getUTCFullYear(), gridStart.getUTCMonth(), gridStart.getUTCDate() + index, 12)
    );
  });
}

export function getSingleSearchParam(
  value?: string | string[] | null
): string | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}
