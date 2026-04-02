import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import { buildAnalyticsSnapshot } from "@/lib/analytics";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [trades, journalDayCount] = await Promise.all([
    prisma.trade.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        date: "asc"
      },
      select: {
        date: true,
        direction: true,
        durationMinutes: true,
        emotion: true,
        entryTime: true,
        followedRules: true,
        heldProfitTarget: true,
        outcome: true,
        pnl: true,
        rMultiple: true,
        reachedTpAfterClose: true,
        respectedStop: true,
        session: true,
        setupType: true,
        symbol: true
      }
    }),
    prisma.journalDay.count({
      where: {
        userId: user.id
      }
    })
  ]);

  const snapshot = buildAnalyticsSnapshot(
    trades.map((trade) => ({
      date: trade.date,
      direction: trade.direction,
      durationMinutes: trade.durationMinutes,
      emotion: trade.emotion,
      entryTime: trade.entryTime,
      followedRules: trade.followedRules,
      heldProfitTarget: trade.heldProfitTarget,
      outcome: trade.outcome,
      pnl: Number(trade.pnl.toString()),
      rMultiple: trade.rMultiple === null ? null : Number(trade.rMultiple.toString()),
      reachedTpAfterClose: trade.reachedTpAfterClose,
      respectedStop: trade.respectedStop,
      session: trade.session,
      setupType: trade.setupType,
      symbol: trade.symbol
    })),
    journalDayCount
  );

  return <AnalyticsShell snapshot={snapshot} userName={user.displayName ?? user.email} />;
}
