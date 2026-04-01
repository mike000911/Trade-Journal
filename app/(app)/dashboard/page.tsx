import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { buildCalendarCells, buildDashboardMetrics, buildEquityCurveData } from "@/lib/dashboard";
import { getMonthBounds, getMonthKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();
  const monthKey = getMonthKey(new Date());
  const { start, end } = getMonthBounds(monthKey);
  const [trades, journalDays] = await Promise.all([
    prisma.trade.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        date: "asc"
      },
      select: {
        date: true,
        outcome: true
      }
    }),
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
    })
  ]);

  const metrics = buildDashboardMetrics(trades, journalDays.length);
  const equityData = buildEquityCurveData(trades);
  const calendar = buildCalendarCells(monthKey, journalDays);

  return (
    <DashboardShell
      calendarDays={calendar.days}
      equityData={equityData}
      metrics={metrics}
      monthKey={monthKey}
      monthLabel={calendar.monthLabel}
      nextMonthKey={calendar.nextMonthKey}
      previousMonthKey={calendar.previousMonthKey}
      userName={user.displayName ?? user.email}
    />
  );
}
