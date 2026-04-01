import { Emotion } from "@prisma/client";
import { saveJournalDayAction } from "@/app/actions/journal";
import { Button } from "@/components/ui/button";

interface JournalDayFormProps {
  dateKey: string;
  monthKey: string;
  values?: {
    dailyEmotion?: Emotion | null;
    keyLevels?: string | null;
    notes?: string | null;
    preGamePlan?: string | null;
  } | null;
}

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-border/70 bg-card/40 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary";

const textareaClassName = `${fieldClassName} min-h-32 resize-y`;

export function JournalDayForm({ dateKey, monthKey, values }: JournalDayFormProps) {
  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="text-xl font-medium">Daily Plan and Review</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Capture the pre-game plan, emotional state, key levels, and any notes for this trading day.
      </p>

      <form action={saveJournalDayAction} className="mt-6">
        <input type="hidden" name="date" value={dateKey} />
        <input type="hidden" name="month" value={monthKey} />

        <label className="text-sm text-muted-foreground">
          Emotional State
          <select className={fieldClassName} name="dailyEmotion" defaultValue={values?.dailyEmotion ?? ""}>
            <option value="">Select emotion</option>
            {Object.values(Emotion).map((emotion) => (
              <option key={emotion} value={emotion}>
                {emotion}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm text-muted-foreground">
          Pre-game Plan
          <textarea
            className={textareaClassName}
            name="preGamePlan"
            defaultValue={values?.preGamePlan ?? ""}
            placeholder="Write the game plan for the session, the setup you want to see, and what you need to avoid."
          />
        </label>

        <label className="mt-4 block text-sm text-muted-foreground">
          Key Levels / Focus Areas
          <textarea
            className={textareaClassName}
            name="keyLevels"
            defaultValue={values?.keyLevels ?? ""}
            placeholder="List important levels, invalidation points, news events, or liquidity targets."
          />
        </label>

        <label className="mt-4 block text-sm text-muted-foreground">
          Notes
          <textarea
            className={textareaClassName}
            name="notes"
            defaultValue={values?.notes ?? ""}
            placeholder="Store reflections, execution notes, or post-session observations."
          />
        </label>

        <Button className="mt-6 w-full md:w-auto">Save Day Notes</Button>
      </form>
    </section>
  );
}
