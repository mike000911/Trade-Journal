import { saveJournalDayAction } from "@/app/actions/journal";
import { MarketAnalysisFields } from "@/components/calendar/market-analysis-fields";
import { buildInitialMarketAnalysis } from "@/lib/market-analysis";

interface JournalDayFormProps {
  dateLabel: string;
  dateKey: string;
  monthKey: string;
  values?: {
    analysis?: unknown;
    dailyEmotion?: string | null;
    keyLevels?: string | null;
    notes?: string | null;
    preGamePlan?: string | null;
  } | null;
}

export function JournalDayForm({ dateKey, dateLabel, monthKey, values }: JournalDayFormProps) {
  return (
    <form action={saveJournalDayAction}>
      <input type="hidden" name="date" value={dateKey} />
      <input type="hidden" name="month" value={monthKey} />
      <MarketAnalysisFields
        dateLabel={dateLabel}
        initialAnalysis={buildInitialMarketAnalysis({
          analysis: values?.analysis,
          keyLevels: values?.keyLevels,
          notes: values?.notes,
          preGamePlan: values?.preGamePlan
        })}
        initialEmotion={values?.dailyEmotion ?? ""}
      />
    </form>
  );
}
