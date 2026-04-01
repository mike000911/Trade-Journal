import { Direction, Emotion, TradeOutcome } from "@prisma/client";
import { createTradeAction } from "@/app/actions/journal";
import { Button } from "@/components/ui/button";

interface TradeEntryFormProps {
  dateKey: string;
  monthKey: string;
}

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-border/70 bg-card/40 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary";

const textareaClassName = `${fieldClassName} min-h-28 resize-y`;

export function TradeEntryForm({ dateKey, monthKey }: TradeEntryFormProps) {
  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium">Add Manual Trade</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Save the setup, trade management changes, and final outcome for the selected calendar day.
          </p>
        </div>
      </div>

      <form action={createTradeAction} className="mt-6 space-y-6">
        <input type="hidden" name="date" value={dateKey} />
        <input type="hidden" name="month" value={monthKey} />

        <section className="rounded-2xl border border-border/70 bg-card/20 p-5">
          <h3 className="text-lg font-medium">Trade Setup</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-muted-foreground">
              Symbol
              <input className={fieldClassName} type="text" name="symbol" placeholder="NVDA" required />
            </label>

            <label className="text-sm text-muted-foreground">
              Strategy Used
              <input className={fieldClassName} type="text" name="setupType" placeholder="Opening range breakout" required />
            </label>

            <label className="text-sm text-muted-foreground">
              Entry Price
              <input className={fieldClassName} type="number" name="entry" step="0.0001" placeholder="192.4500" required />
            </label>

            <label className="text-sm text-muted-foreground">
              Direction
              <select className={fieldClassName} name="direction" defaultValue={Direction.LONG}>
                {Object.values(Direction).map((direction) => (
                  <option key={direction} value={direction}>
                    {direction}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-muted-foreground md:col-span-2">
              Time of Day
              <input className={fieldClassName} type="time" name="entryTime" required />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/20 p-5">
          <h3 className="text-lg font-medium">Trade Management</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-muted-foreground">
              Take Profit Level
              <input className={fieldClassName} type="number" name="takeProfit" step="0.0001" placeholder="195.2500" />
            </label>

            <label className="text-sm text-muted-foreground">
              Initial Stop Loss
              <input className={fieldClassName} type="number" name="stopLoss" step="0.0001" placeholder="191.8000" />
            </label>

            <label className="text-sm text-muted-foreground">
              Moved Stop
              <input className={fieldClassName} type="number" name="movedStopLoss" step="0.0001" placeholder="192.1000" />
            </label>

            <div className="hidden md:block" />
          </div>

          <label className="mt-4 block text-sm text-muted-foreground">
            Why was the stop moved?
            <textarea
              className={textareaClassName}
              name="stopMoveReason"
              placeholder="Explain what changed in the trade and why the stop was adjusted."
            />
          </label>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/20 p-5">
          <h3 className="text-lg font-medium">Trade Results</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-muted-foreground">
              Result
              <select className={fieldClassName} name="outcome" defaultValue={TradeOutcome.MANUAL_CLOSE}>
                <option value={TradeOutcome.STOP_LOSS_HIT}>Stop loss hit</option>
                <option value={TradeOutcome.TAKE_PROFIT_HIT}>Take profit hit</option>
                <option value={TradeOutcome.MANUAL_CLOSE}>Manual closure</option>
              </select>
            </label>

            <label className="text-sm text-muted-foreground">
              How long did the trade last?
              <input className={fieldClassName} type="number" name="durationMinutes" min="1" step="1" placeholder="45 minutes" />
            </label>

            <label className="text-sm text-muted-foreground md:col-span-2">
              Did price eventually reach take profit after a manual close?
              <select className={fieldClassName} name="reachedTpAfterClose" defaultValue="">
                <option value="">Not applicable</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="text-sm text-muted-foreground">
              Did I follow my rules?
              <select className={fieldClassName} name="followedRules" defaultValue="">
                <option value="">Not logged</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="text-sm text-muted-foreground">
              Did I hold on to my profit target?
              <select className={fieldClassName} name="heldProfitTarget" defaultValue="">
                <option value="">Not logged</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="text-sm text-muted-foreground">
              Did I respect my stop?
              <select className={fieldClassName} name="respectedStop" defaultValue="">
                <option value="">Not logged</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="text-sm text-muted-foreground">
              Emotion
              <select className={fieldClassName} name="emotion" defaultValue="">
                <option value="">Select emotion</option>
                {Object.values(Emotion).map((emotion) => (
                  <option key={emotion} value={emotion}>
                    {emotion}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block text-sm text-muted-foreground">
            Result Notes
            <textarea
              className={textareaClassName}
              name="resultNotes"
              placeholder="Capture whether the stop was hit, TP was reached, or the trade was manually closed and how it unfolded."
            />
          </label>
        </section>

        <Button className="w-full md:w-auto">Save Trade</Button>
      </form>
    </section>
  );
}
