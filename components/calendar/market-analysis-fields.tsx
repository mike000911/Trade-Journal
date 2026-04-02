"use client";

import { useState } from "react";
import {
  CalendarClock,
  ChartNoAxesColumn,
  Flag,
  ImagePlus,
  Layers3,
  MapPin,
  NotebookPen,
  Plus,
  Target,
  Trash2,
  TrendingUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BIAS_OPTIONS,
  MARKET_OPTIONS,
  createArea,
  createChartAnalysis,
  createCustomSection,
  createEmptyMarketAnalysis,
  createPoint,
  type MarketAnalysisArea,
  type MarketAnalysisChart,
  type MarketAnalysisPoint,
  type MarketAnalysisSection,
  type MarketAnalysisState
} from "@/lib/market-analysis";

const emotionOptions = ["CALM", "FOCUSED", "HESITANT", "FOMO", "REVENGE", "OVERCONFIDENT"] as const;

const shellClassName =
  "rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,31,0.96),rgba(10,13,20,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.32)]";

const fieldClassName =
  "w-full rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/45 focus:bg-white/[0.05]";

const textAreaClassName = `${fieldClassName} min-h-[132px] resize-y`;

const sectionHeaderClassName =
  "flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4";

type PointListKey = "contextPoints" | "longScenarios" | "shortScenarios";

function SectionCard({
  children,
  icon: Icon,
  subtitle,
  title
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  title: string;
}) {
  return (
    <section className={shellClassName}>
      <div className={sectionHeaderClassName}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/10 bg-sky-400/10 text-sky-300">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
            {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ListInput({
  onChange,
  onRemove,
  placeholder,
  value
}: {
  onChange: (nextValue: string) => void;
  onRemove: () => void;
  placeholder: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 w-2.5 rounded-full bg-sky-400/70" />
      <input className={fieldClassName} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
      <button
        type="button"
        onClick={onRemove}
        className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-slate-400 transition hover:border-rose-400/30 hover:text-rose-300"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function MarketAnalysisFields({
  dateLabel,
  initialAnalysis,
  initialEmotion
}: {
  dateLabel: string;
  initialAnalysis: MarketAnalysisState;
  initialEmotion?: string | null;
}) {
  const [analysis, setAnalysis] = useState<MarketAnalysisState>(initialAnalysis);
  const [dailyEmotion, setDailyEmotion] = useState(initialEmotion ?? "");

  function updateField<Key extends keyof MarketAnalysisState>(key: Key, value: MarketAnalysisState[Key]) {
    setAnalysis((current) => ({
      ...current,
      [key]: value
    }));
  }

  function updatePointList(key: PointListKey, id: string, text: string) {
    setAnalysis((current) => ({
      ...current,
      [key]: current[key].map((item) => (item.id === id ? { ...item, text } : item))
    }));
  }

  function addPointToList(key: PointListKey) {
    const prefix = key === "contextPoints" ? "context" : key === "longScenarios" ? "long" : "short";
    setAnalysis((current) => ({
      ...current,
      [key]: [...current[key], createPoint(prefix)]
    }));
  }

  function removePointFromList(key: PointListKey, id: string) {
    setAnalysis((current) => {
      const remaining = current[key].filter((item) => item.id !== id);

      return {
        ...current,
        [key]: remaining.length || key !== "contextPoints" ? remaining : [createPoint("context")]
      };
    });
  }

  function updateArea(id: string, nextValue: Partial<MarketAnalysisArea>) {
    setAnalysis((current) => ({
      ...current,
      keyAreas: current.keyAreas.map((item) => (item.id === id ? { ...item, ...nextValue } : item))
    }));
  }

  function updateChart(id: string, nextValue: Partial<MarketAnalysisChart>) {
    setAnalysis((current) => ({
      ...current,
      chartAnalyses: current.chartAnalyses.map((item) => (item.id === id ? { ...item, ...nextValue } : item))
    }));
  }

  function updateCustomSection(id: string, nextValue: Partial<MarketAnalysisSection>) {
    setAnalysis((current) => ({
      ...current,
      customSections: current.customSections.map((item) => (item.id === id ? { ...item, ...nextValue } : item))
    }));
  }

  function resetForm() {
    setAnalysis(createEmptyMarketAnalysis());
    setDailyEmotion(initialEmotion ?? "");
  }

  const serializedAnalysis = JSON.stringify(analysis);

  return (
    <div className="space-y-6">
      <input type="hidden" name="analysis" value={serializedAnalysis} readOnly />

      <section className={`${shellClassName} overflow-hidden`}>
        <div className="border-b border-white/8 px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-sky-300">
                <ChartNoAxesColumn className="h-3.5 w-3.5" />
                Market Analysis
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
                Prepare and review sessions
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
                Structure your pre-session preparation with focus, bias, scenarios, and chart observations before you start trading.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                <CalendarClock className="h-4 w-4 text-sky-300" />
                <span className="text-slate-400">Selected day</span>
                <span className="font-medium text-slate-100">{dateLabel}</span>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200 transition hover:border-rose-400/35 hover:bg-rose-400/15"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 lg:grid-cols-4">
          <label className="text-sm text-slate-300">
            Focus Market
            <input
              className={`${fieldClassName} mt-2`}
              list="focus-market-options"
              placeholder="Type or select market..."
              value={analysis.focusMarket}
              onChange={(event) => updateField("focusMarket", event.target.value)}
            />
            <datalist id="focus-market-options">
              {MARKET_OPTIONS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <label className="text-sm text-slate-300">
            HTF Bias
            <select className={`${fieldClassName} mt-2`} value={analysis.htfBias} onChange={(event) => updateField("htfBias", event.target.value)}>
              <option value="">Select bias...</option>
              {BIAS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">
            Intraday Bias
            <select
              className={`${fieldClassName} mt-2`}
              value={analysis.intradayBias}
              onChange={(event) => updateField("intradayBias", event.target.value)}
            >
              <option value="">Select bias...</option>
              {BIAS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-300">
            Day Risk Limit
            <input
              className={`${fieldClassName} mt-2`}
              placeholder="e.g. -2R max"
              value={analysis.dayRiskLimit}
              onChange={(event) => updateField("dayRiskLimit", event.target.value)}
            />
          </label>

          <label className="text-sm text-slate-300 lg:col-span-4">
            Daily Emotion
            <select className={`${fieldClassName} mt-2`} name="dailyEmotion" value={dailyEmotion} onChange={(event) => setDailyEmotion(event.target.value)}>
              <option value="">Select emotion</option>
              {emotionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <SectionCard icon={Flag} title="Theme" subtitle="What matters most today? Capture the one thing you need to trade around.">
        <textarea
          className={`${textAreaClassName} min-h-[110px]`}
          placeholder="What matters most today?"
          value={analysis.theme}
          onChange={(event) => updateField("theme", event.target.value)}
        />
      </SectionCard>

      <SectionCard icon={NotebookPen} title="Context" subtitle="Add the market context points that shape how you want to think today.">
        <div className="space-y-3">
          {analysis.contextPoints.map((item) => (
            <ListInput
              key={item.id}
              placeholder="Add context point..."
              value={item.text}
              onChange={(nextValue) => updatePointList("contextPoints", item.id, nextValue)}
              onRemove={() => removePointFromList("contextPoints", item.id)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => addPointToList("contextPoints")}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-sky-400/30 hover:text-sky-200"
        >
          <Plus className="h-4 w-4" />
          Add point
        </button>
      </SectionCard>

      <SectionCard icon={TrendingUpDown} title="Bias" subtitle="Separate the bigger-picture thesis from the current session read.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03]">
            <div className="border-b border-white/8 px-4 py-3 text-sm font-semibold text-slate-200">Higher Timeframe (HTF)</div>
            <div className="p-4">
              <textarea
                className={textAreaClassName}
                placeholder="What's the bigger picture? Daily/4H trend, key levels..."
                value={analysis.higherTimeframeNotes}
                onChange={(event) => updateField("higherTimeframeNotes", event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03]">
            <div className="border-b border-white/8 px-4 py-3 text-sm font-semibold text-slate-200">Intraday</div>
            <div className="p-4">
              <textarea
                className={textAreaClassName}
                placeholder="Today's price action, session flow, key observations..."
                value={analysis.intradayNotes}
                onChange={(event) => updateField("intradayNotes", event.target.value)}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard icon={MapPin} title="Key Areas" subtitle="Map the important areas and zones you want to respect.">
          <div className="space-y-4">
            {analysis.keyAreas.length ? (
              analysis.keyAreas.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="grid gap-3 md:grid-cols-[0.75fr_1.25fr_auto]">
                    <select
                      className={fieldClassName}
                      value={item.kind}
                      onChange={(event) => updateArea(item.id, { kind: event.target.value as MarketAnalysisArea["kind"] })}
                    >
                      <option value="AREA">Area</option>
                      <option value="ZONE">Zone</option>
                    </select>
                    <input
                      className={fieldClassName}
                      placeholder="Area label"
                      value={item.label}
                      onChange={(event) => updateArea(item.id, { label: event.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => updateField("keyAreas", analysis.keyAreas.filter((area) => area.id !== item.id))}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-slate-400 transition hover:border-rose-400/30 hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <textarea
                    className={`${textAreaClassName} mt-3 min-h-[100px]`}
                    placeholder="Why does this area matter?"
                    value={item.details}
                    onChange={(event) => updateArea(item.id, { details: event.target.value })}
                  />
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-slate-500">
                No areas added yet.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => updateField("keyAreas", [...analysis.keyAreas, createArea("AREA")])}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-sky-400/30 hover:text-sky-200"
              >
                <Plus className="h-4 w-4" />
                Add Area
              </button>
              <button
                type="button"
                onClick={() => updateField("keyAreas", [...analysis.keyAreas, createArea("ZONE")])}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-sky-400/30 hover:text-sky-200"
              >
                <Plus className="h-4 w-4" />
                Add Zone
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Target} title="Scenarios" subtitle="Write the long and short outcomes you are prepared to act on.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <h4 className="text-sm font-semibold text-slate-100">Long setups</h4>
              <div className="mt-4 space-y-3">
                {analysis.longScenarios.map((item) => (
                  <ListInput
                    key={item.id}
                    placeholder="Add long scenario"
                    value={item.text}
                    onChange={(nextValue) => updatePointList("longScenarios", item.id, nextValue)}
                    onRemove={() => removePointFromList("longScenarios", item.id)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => addPointToList("longScenarios")}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-emerald-400/25 hover:text-emerald-200"
              >
                <Plus className="h-4 w-4" />
                Add Long
              </button>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <h4 className="text-sm font-semibold text-slate-100">Short setups</h4>
              <div className="mt-4 space-y-3">
                {analysis.shortScenarios.map((item) => (
                  <ListInput
                    key={item.id}
                    placeholder="Add short scenario"
                    value={item.text}
                    onChange={(nextValue) => updatePointList("shortScenarios", item.id, nextValue)}
                    onRemove={() => removePointFromList("shortScenarios", item.id)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => addPointToList("shortScenarios")}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-rose-400/25 hover:text-rose-200"
              >
                <Plus className="h-4 w-4" />
                Add Short
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard icon={ImagePlus} title="Chart Analysis" subtitle="Attach chart references, labels, and the observations you want to remember.">
        <div className="space-y-4">
          {analysis.chartAnalyses.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <div className="grid gap-4 xl:grid-cols-[220px_1fr]">
                <div
                  className="flex min-h-[170px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-[#0b1018] bg-cover bg-center text-center"
                  style={item.imageUrl ? { backgroundImage: `linear-gradient(rgba(9,12,19,0.48),rgba(9,12,19,0.72)), url(${item.imageUrl})` } : undefined}
                >
                  <div className="px-4 text-sm text-slate-400">
                    <ImagePlus className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                    <p>{item.imageUrl ? "Preview from chart URL" : "Paste a chart image URL to preview it here"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    className={fieldClassName}
                    placeholder="Chart label (e.g. HTF Structure, Key Levels)"
                    value={item.title}
                    onChange={(event) => updateChart(item.id, { title: event.target.value })}
                  />
                  <input
                    className={fieldClassName}
                    placeholder="Chart image URL"
                    value={item.imageUrl}
                    onChange={(event) => updateChart(item.id, { imageUrl: event.target.value })}
                  />
                  <textarea
                    className={`${textAreaClassName} min-h-[120px]`}
                    placeholder="What are you watching? Key observations for this chart..."
                    value={item.notes}
                    onChange={(event) => updateChart(item.id, { notes: event.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      "chartAnalyses",
                      analysis.chartAnalyses.length > 1
                        ? analysis.chartAnalyses.filter((chart) => chart.id !== item.id)
                        : [createChartAnalysis()]
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-400/35 hover:bg-rose-400/15"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => updateField("chartAnalyses", [...analysis.chartAnalyses, createChartAnalysis()])}
            className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-sky-400/30 hover:text-sky-200"
          >
            <Plus className="h-4 w-4" />
            Add Chart Analysis
          </button>
        </div>
      </SectionCard>

      <SectionCard icon={Layers3} title="Custom Sections" subtitle="Add any extra blocks that matter to your process, review, or checklist.">
        <div className="space-y-4">
          {analysis.customSections.length ? (
            analysis.customSections.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    className={fieldClassName}
                    placeholder="Section title"
                    value={item.title}
                    onChange={(event) => updateCustomSection(item.id, { title: event.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => updateField("customSections", analysis.customSections.filter((section) => section.id !== item.id))}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-slate-400 transition hover:border-rose-400/30 hover:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <textarea
                  className={`${textAreaClassName} mt-3 min-h-[120px]`}
                  placeholder="Write the content for this custom section..."
                  value={item.body}
                  onChange={(event) => updateCustomSection(item.id, { body: event.target.value })}
                />
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-slate-500">
              No custom sections yet.
            </div>
          )}

          <button
            type="button"
            onClick={() => updateField("customSections", [...analysis.customSections, createCustomSection()])}
            className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-sky-400/30 hover:text-sky-200"
          >
            <Plus className="h-4 w-4" />
            Add Custom Section
          </button>
        </div>
      </SectionCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Save this plan before trading so it is attached to the selected session and available for review later.
        </p>
        <Button className="h-12 px-8">Save Session Plan</Button>
      </div>
    </div>
  );
}
