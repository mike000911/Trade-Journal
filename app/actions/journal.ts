"use server";

import { Direction, Emotion, Session as TradingSession, TradeOutcome } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ensureDateKey, ensureMonthKey, parseDateKey } from "@/lib/date";
import { prisma } from "@/lib/prisma";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toNullable(value: string) {
  return value ? value : null;
}

function buildCalendarUrl(dateKey: string, monthKey: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams({
    date: dateKey,
    month: monthKey
  });

  for (const [key, value] of Object.entries(params ?? {})) {
    searchParams.set(key, value);
  }

  return `/calendar?${searchParams.toString()}`;
}

function parseEmotion(value: string) {
  return Object.values(Emotion).includes(value as Emotion) ? (value as Emotion) : null;
}

function parseDirection(value: string) {
  return Object.values(Direction).includes(value as Direction) ? (value as Direction) : null;
}

function parseTradeOutcome(value: string) {
  return Object.values(TradeOutcome).includes(value as TradeOutcome) ? (value as TradeOutcome) : null;
}

function parseBooleanish(value: string) {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
}

function inferTradingSession(entryTime: string) {
  const [hoursText, minutesText] = entryTime.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes < 9 * 60 + 30) {
    return TradingSession.PREMARKET;
  }

  if (totalMinutes < 11 * 60) {
    return TradingSession.OPEN;
  }

  if (totalMinutes < 14 * 60 + 30) {
    return TradingSession.MIDDAY;
  }

  if (totalMinutes <= 16 * 60) {
    return TradingSession.POWER_HOUR;
  }

  return TradingSession.AFTER_HOURS;
}

async function getOrCreateJournalDay(userId: string, dateKey: string) {
  const date = parseDateKey(dateKey);

  if (!date) {
    throw new Error("Invalid trade date.");
  }

  const existing = await prisma.journalDay.findUnique({
    where: {
      userId_date: {
        userId,
        date
      }
    }
  });

  if (existing) {
    return existing;
  }

  return prisma.journalDay.create({
    data: {
      date,
      userId
    }
  });
}

export async function saveJournalDayAction(formData: FormData) {
  const user = await requireUser();
  const dateKey = ensureDateKey(getValue(formData, "date"));
  const monthKey = ensureMonthKey(getValue(formData, "month"), dateKey.slice(0, 7));
  const date = parseDateKey(dateKey);

  if (!date) {
    redirect(buildCalendarUrl(dateKey, monthKey, { error: "Pick a valid calendar date." }));
  }

  await prisma.journalDay.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date
      }
    },
    update: {
      dailyEmotion: parseEmotion(getValue(formData, "dailyEmotion")),
      keyLevels: toNullable(getValue(formData, "keyLevels")),
      notes: toNullable(getValue(formData, "notes")),
      preGamePlan: toNullable(getValue(formData, "preGamePlan"))
    },
    create: {
      dailyEmotion: parseEmotion(getValue(formData, "dailyEmotion")),
      date,
      keyLevels: toNullable(getValue(formData, "keyLevels")),
      notes: toNullable(getValue(formData, "notes")),
      preGamePlan: toNullable(getValue(formData, "preGamePlan")),
      userId: user.id
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  redirect(buildCalendarUrl(dateKey, monthKey, { message: "Day plan saved." }));
}

export async function createTradeAction(formData: FormData) {
  const user = await requireUser();
  const dateKey = ensureDateKey(getValue(formData, "date"));
  const monthKey = ensureMonthKey(getValue(formData, "month"), dateKey.slice(0, 7));
  const date = parseDateKey(dateKey);
  const symbol = getValue(formData, "symbol").toUpperCase();
  const entryTime = getValue(formData, "entryTime");
  const session = inferTradingSession(entryTime);
  const direction = parseDirection(getValue(formData, "direction"));
  const entry = Number(getValue(formData, "entry"));
  const stopLossValue = getValue(formData, "stopLoss");
  const movedStopLossValue = getValue(formData, "movedStopLoss");
  const takeProfitValue = getValue(formData, "takeProfit");
  const setupType = getValue(formData, "setupType");
  const outcome = parseTradeOutcome(getValue(formData, "outcome"));
  const durationMinutesValue = getValue(formData, "durationMinutes");

  if (!date || !symbol || !session || !direction || !setupType || !outcome || !entryTime || !Number.isFinite(entry)) {
    redirect(buildCalendarUrl(dateKey, monthKey, { error: "Fill in the required trade fields." }));
  }

  const stopLoss = stopLossValue ? Number(stopLossValue) : null;
  const movedStopLoss = movedStopLossValue ? Number(movedStopLossValue) : null;
  const takeProfit = takeProfitValue ? Number(takeProfitValue) : null;
  const actualStop = movedStopLoss ?? stopLoss;
  const durationMinutes = durationMinutesValue ? Number.parseInt(durationMinutesValue, 10) : null;
  const emotion = parseEmotion(getValue(formData, "emotion"));
  const followedRules = parseBooleanish(getValue(formData, "followedRules"));
  const heldProfitTarget = parseBooleanish(getValue(formData, "heldProfitTarget"));
  const respectedStop = parseBooleanish(getValue(formData, "respectedStop"));
  const reachedTpAfterClose = parseBooleanish(getValue(formData, "reachedTpAfterClose"));

  if (durationMinutes !== null && (!Number.isInteger(durationMinutes) || durationMinutes <= 0)) {
    redirect(buildCalendarUrl(dateKey, monthKey, { error: "Duration must be a positive whole number of minutes." }));
  }

  if (outcome === TradeOutcome.STOP_LOSS_HIT && actualStop === null) {
    redirect(buildCalendarUrl(dateKey, monthKey, { error: "Add an initial stop or moved stop before marking the trade as stopped out." }));
  }

  if (outcome === TradeOutcome.TAKE_PROFIT_HIT && takeProfit === null) {
    redirect(buildCalendarUrl(dateKey, monthKey, { error: "Add a take profit level before marking the trade as TP hit." }));
  }

  const exit =
    outcome === TradeOutcome.TAKE_PROFIT_HIT && takeProfit !== null
      ? takeProfit
      : outcome === TradeOutcome.STOP_LOSS_HIT && actualStop !== null
        ? actualStop
        : entry;
  const positionSize = 1;
  const pnlRaw = direction === Direction.LONG ? exit - entry : entry - exit;
  const pnl = Number(pnlRaw.toFixed(2));
  const riskPerShare = actualStop === null ? 0 : Math.abs(entry - actualStop);
  const totalRisk = riskPerShare * positionSize;
  const rMultiple = totalRisk > 0 ? Number((pnl / totalRisk).toFixed(2)) : null;
  const journalDay = await getOrCreateJournalDay(user.id, dateKey);

  await prisma.trade.create({
    data: {
      bias: toNullable(getValue(formData, "bias")),
      date,
      direction,
      entry: entry.toFixed(4),
      entryTime,
      emotion,
      exit: exit.toFixed(4),
      followedRules,
      heldProfitTarget,
      journalDayId: journalDay.id,
      movedStopLoss: movedStopLoss === null ? null : movedStopLoss.toFixed(4),
      outcome,
      pnl: pnl.toFixed(2),
      positionSize,
      rMultiple: rMultiple === null ? null : rMultiple.toFixed(2),
      reachedTpAfterClose: outcome === TradeOutcome.MANUAL_CLOSE ? reachedTpAfterClose : null,
      respectedStop,
      resultNotes: toNullable(getValue(formData, "resultNotes")),
      session,
      setupType,
      stopMoveReason: toNullable(getValue(formData, "stopMoveReason")),
      stopLoss: stopLoss === null ? null : stopLoss.toFixed(4),
      symbol,
      takeProfit: takeProfit === null ? null : takeProfit.toFixed(4),
      durationMinutes,
      userId: user.id
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  redirect(buildCalendarUrl(dateKey, monthKey, { message: `${symbol} trade saved.` }));
}

export async function deleteTradeAction(formData: FormData) {
  const user = await requireUser();
  const tradeId = getValue(formData, "tradeId");
  const dateKey = ensureDateKey(getValue(formData, "date"));
  const monthKey = ensureMonthKey(getValue(formData, "month"), dateKey.slice(0, 7));

  if (!tradeId) {
    redirect(buildCalendarUrl(dateKey, monthKey));
  }

  await prisma.trade.deleteMany({
    where: {
      id: tradeId,
      userId: user.id
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  redirect(buildCalendarUrl(dateKey, monthKey, { message: "Trade removed." }));
}
