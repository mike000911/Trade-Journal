-- CreateEnum
CREATE TYPE "Session" AS ENUM ('PREMARKET', 'OPEN', 'MIDDAY', 'POWER_HOUR', 'AFTER_HOURS');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "TradeOutcome" AS ENUM ('STOP_LOSS_HIT', 'TAKE_PROFIT_HIT', 'MANUAL_CLOSE');

-- CreateEnum
CREATE TYPE "Emotion" AS ENUM ('CALM', 'FOCUSED', 'HESITANT', 'FOMO', 'REVENGE', 'OVERCONFIDENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "displayName" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "preGamePlan" TEXT,
    "keyLevels" TEXT,
    "dailyEmotion" "Emotion",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journalDayId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "symbol" TEXT NOT NULL,
    "entryTime" TEXT,
    "session" "Session" NOT NULL,
    "direction" "Direction" NOT NULL,
    "entry" DECIMAL(12,4) NOT NULL,
    "exit" DECIMAL(12,4) NOT NULL,
    "stopLoss" DECIMAL(12,4),
    "movedStopLoss" DECIMAL(12,4),
    "takeProfit" DECIMAL(12,4),
    "positionSize" INTEGER NOT NULL,
    "pnl" DECIMAL(12,2) NOT NULL,
    "rMultiple" DECIMAL(8,2),
    "outcome" "TradeOutcome",
    "followedRules" BOOLEAN,
    "heldProfitTarget" BOOLEAN,
    "respectedStop" BOOLEAN,
    "reachedTpAfterClose" BOOLEAN,
    "durationMinutes" INTEGER,
    "stopMoveReason" TEXT,
    "resultNotes" TEXT,
    "setupType" TEXT NOT NULL,
    "bias" TEXT,
    "liquidityTarget" TEXT,
    "entryReason" TEXT,
    "exitReason" TEXT,
    "emotion" "Emotion",
    "ruleAdherence" INTEGER,
    "mistakeType" TEXT,
    "lesson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeScreenshot" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "userNotes" TEXT,
    "aiSummary" TEXT,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "repeatedMistakes" TEXT[],
    "actionPoints" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

-- CreateIndex
CREATE INDEX "JournalDay_userId_date_idx" ON "JournalDay"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "JournalDay_userId_date_key" ON "JournalDay"("userId", "date");

-- CreateIndex
CREATE INDEX "Trade_userId_date_idx" ON "Trade"("userId", "date");

-- CreateIndex
CREATE INDEX "Trade_journalDayId_idx" ON "Trade"("journalDayId");

-- CreateIndex
CREATE INDEX "Trade_symbol_idx" ON "Trade"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReview_userId_weekStart_weekEnd_key" ON "WeeklyReview"("userId", "weekStart", "weekEnd");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalDay" ADD CONSTRAINT "JournalDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_journalDayId_fkey" FOREIGN KEY ("journalDayId") REFERENCES "JournalDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeScreenshot" ADD CONSTRAINT "TradeScreenshot_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReview" ADD CONSTRAINT "WeeklyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
