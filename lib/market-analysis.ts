export const MARKET_OPTIONS = ["NQ", "MNQ", "QQQ", "NVDA", "TSLA", "AAPL", "META", "AMD"] as const;

export const BIAS_OPTIONS = ["Bullish", "Bearish", "Neutral", "Two-way", "Wait and see"] as const;

export type MarketAnalysisPoint = {
  id: string;
  text: string;
};

export type MarketAnalysisArea = {
  details: string;
  id: string;
  kind: "AREA" | "ZONE";
  label: string;
};

export type MarketAnalysisChart = {
  id: string;
  imageUrl: string;
  notes: string;
  title: string;
};

export type MarketAnalysisSection = {
  body: string;
  id: string;
  title: string;
};

export type MarketAnalysisState = {
  chartAnalyses: MarketAnalysisChart[];
  contextPoints: MarketAnalysisPoint[];
  customSections: MarketAnalysisSection[];
  dayRiskLimit: string;
  focusMarket: string;
  higherTimeframeNotes: string;
  htfBias: string;
  intradayBias: string;
  intradayNotes: string;
  keyAreas: MarketAnalysisArea[];
  longScenarios: MarketAnalysisPoint[];
  shortScenarios: MarketAnalysisPoint[];
  theme: string;
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createPoint(prefix: string, text = ""): MarketAnalysisPoint {
  return {
    id: createId(prefix),
    text
  };
}

export function createArea(kind: "AREA" | "ZONE" = "AREA"): MarketAnalysisArea {
  return {
    details: "",
    id: createId(kind.toLowerCase()),
    kind,
    label: ""
  };
}

export function createChartAnalysis(): MarketAnalysisChart {
  return {
    id: createId("chart"),
    imageUrl: "",
    notes: "",
    title: ""
  };
}

export function createCustomSection(): MarketAnalysisSection {
  return {
    body: "",
    id: createId("section"),
    title: ""
  };
}

export function createEmptyMarketAnalysis(): MarketAnalysisState {
  return {
    chartAnalyses: [createChartAnalysis()],
    contextPoints: [createPoint("context")],
    customSections: [],
    dayRiskLimit: "",
    focusMarket: "",
    higherTimeframeNotes: "",
    htfBias: "",
    intradayBias: "",
    intradayNotes: "",
    keyAreas: [],
    longScenarios: [],
    shortScenarios: [],
    theme: ""
  };
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizePointArray(value: unknown, prefix: string) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (typeof item === "string") {
      return createPoint(prefix, item);
    }

    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;

      return {
        id: asString(record.id) || createId(prefix),
        text: asString(record.text)
      } satisfies MarketAnalysisPoint;
    }

    return createPoint(prefix);
  });
}

function normalizeAreaArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (!item || typeof item !== "object") {
      return createArea();
    }

    const record = item as Record<string, unknown>;
    const kind = record.kind === "ZONE" ? "ZONE" : "AREA";

    return {
      details: asString(record.details),
      id: asString(record.id) || createId(kind.toLowerCase()),
      kind,
      label: asString(record.label)
    } satisfies MarketAnalysisArea;
  });
}

function normalizeChartArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (!item || typeof item !== "object") {
      return createChartAnalysis();
    }

    const record = item as Record<string, unknown>;

    return {
      id: asString(record.id) || createId("chart"),
      imageUrl: asString(record.imageUrl),
      notes: asString(record.notes),
      title: asString(record.title)
    } satisfies MarketAnalysisChart;
  });
}

function normalizeSectionArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (!item || typeof item !== "object") {
      return createCustomSection();
    }

    const record = item as Record<string, unknown>;

    return {
      body: asString(record.body),
      id: asString(record.id) || createId("section"),
      title: asString(record.title)
    } satisfies MarketAnalysisSection;
  });
}

export function normalizeMarketAnalysis(value: unknown): MarketAnalysisState {
  const defaults = createEmptyMarketAnalysis();

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaults;
  }

  const record = value as Record<string, unknown>;
  const contextPoints = normalizePointArray(record.contextPoints, "context");
  const chartAnalyses = normalizeChartArray(record.chartAnalyses);

  return {
    chartAnalyses: chartAnalyses.length ? chartAnalyses : defaults.chartAnalyses,
    contextPoints: contextPoints.length ? contextPoints : defaults.contextPoints,
    customSections: normalizeSectionArray(record.customSections),
    dayRiskLimit: asString(record.dayRiskLimit),
    focusMarket: asString(record.focusMarket),
    higherTimeframeNotes: asString(record.higherTimeframeNotes),
    htfBias: asString(record.htfBias),
    intradayBias: asString(record.intradayBias),
    intradayNotes: asString(record.intradayNotes),
    keyAreas: normalizeAreaArray(record.keyAreas),
    longScenarios: normalizePointArray(record.longScenarios, "long"),
    shortScenarios: normalizePointArray(record.shortScenarios, "short"),
    theme: asString(record.theme)
  };
}

function hasMeaningfulContent(value: MarketAnalysisState) {
  return Boolean(
    value.focusMarket ||
      value.htfBias ||
      value.intradayBias ||
      value.dayRiskLimit ||
      value.theme ||
      value.higherTimeframeNotes ||
      value.intradayNotes ||
      value.contextPoints.some((item) => item.text) ||
      value.keyAreas.some((item) => item.label || item.details) ||
      value.longScenarios.some((item) => item.text) ||
      value.shortScenarios.some((item) => item.text) ||
      value.chartAnalyses.some((item) => item.title || item.notes || item.imageUrl) ||
      value.customSections.some((item) => item.title || item.body)
  );
}

export function buildInitialMarketAnalysis(params?: {
  analysis?: unknown;
  keyLevels?: string | null;
  notes?: string | null;
  preGamePlan?: string | null;
}) {
  const normalized = normalizeMarketAnalysis(params?.analysis);

  if (hasMeaningfulContent(normalized)) {
    return normalized;
  }

  const legacy = createEmptyMarketAnalysis();

  legacy.theme = params?.preGamePlan ?? "";
  legacy.keyAreas = params?.keyLevels
    ? [
        {
          details: params.keyLevels,
          id: createId("legacy-area"),
          kind: "AREA",
          label: "Legacy key levels"
        }
      ]
    : [];
  legacy.customSections = params?.notes
    ? [
        {
          body: params.notes,
          id: createId("legacy-notes"),
          title: "Legacy notes"
        }
      ]
    : [];

  return legacy;
}

function formatSection(title: string, lines: string[]) {
  const content = lines.filter(Boolean);

  if (!content.length) {
    return "";
  }

  return `${title}\n${content.join("\n")}`;
}

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function buildLegacyJournalFields(analysis: MarketAnalysisState) {
  const plan = formatSection("Session Plan", [
    analysis.focusMarket ? `Focus market: ${analysis.focusMarket}` : "",
    analysis.htfBias ? `HTF bias: ${analysis.htfBias}` : "",
    analysis.intradayBias ? `Intraday bias: ${analysis.intradayBias}` : "",
    analysis.dayRiskLimit ? `Day risk limit: ${analysis.dayRiskLimit}` : "",
    analysis.theme ? `Theme:\n${analysis.theme}` : "",
    analysis.higherTimeframeNotes ? `HTF notes:\n${analysis.higherTimeframeNotes}` : "",
    analysis.intradayNotes ? `Intraday notes:\n${analysis.intradayNotes}` : ""
  ]);

  const keyLevels = formatSection("Key Levels and Scenarios", [
    analysis.keyAreas.length
      ? `Key areas:\n${analysis.keyAreas
          .filter((item) => item.label || item.details)
          .map((item) => `- ${item.kind}: ${item.label || "Untitled"}${item.details ? ` | ${item.details}` : ""}`)
          .join("\n")}`
      : "",
    analysis.longScenarios.some((item) => item.text)
      ? `Long scenarios:\n${analysis.longScenarios
          .filter((item) => item.text)
          .map((item) => `- ${item.text}`)
          .join("\n")}`
      : "",
    analysis.shortScenarios.some((item) => item.text)
      ? `Short scenarios:\n${analysis.shortScenarios
          .filter((item) => item.text)
          .map((item) => `- ${item.text}`)
          .join("\n")}`
      : ""
  ]);

  const notes = formatSection("Context and Review Notes", [
    analysis.contextPoints.some((item) => item.text)
      ? `Context:\n${analysis.contextPoints
          .filter((item) => item.text)
          .map((item) => `- ${item.text}`)
          .join("\n")}`
      : "",
    analysis.chartAnalyses.some((item) => item.title || item.notes || item.imageUrl)
      ? `Chart analysis:\n${analysis.chartAnalyses
          .filter((item) => item.title || item.notes || item.imageUrl)
          .map((item) => `- ${item.title || "Chart"}${item.imageUrl ? ` [${item.imageUrl}]` : ""}${item.notes ? `\n  ${item.notes}` : ""}`)
          .join("\n")}`
      : "",
    analysis.customSections.some((item) => item.title || item.body)
      ? `Custom sections:\n${analysis.customSections
          .filter((item) => item.title || item.body)
          .map((item) => `- ${item.title || "Section"}${item.body ? `\n  ${item.body}` : ""}`)
          .join("\n")}`
      : ""
  ]);

  return {
    keyLevels: nullableText(keyLevels),
    notes: nullableText(notes),
    preGamePlan: nullableText(plan)
  };
}
