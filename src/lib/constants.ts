/** Default simulation horizon in months. */
export const SIMULATION_MONTHS = 30;

/** Months of runway simulated after apartment entry. */
export const POST_ENTRY_BUFFER_MONTHS = 12;

/** Max entry-month offset on mortgage slider. */
export const MAX_ENTRY_MONTH_OFFSET = 36;

/** Max scenario month index for income start / similar sliders. */
export const MAX_SCENARIO_MONTH = 36;

/** Max net monthly income per source (~4× senior hi-tech; CBS avg ~₪12K). */
export const MAX_MONTHLY_INCOME = 80_000;

/** Max monthly household expenses excluding rent (family budget ~₪10–14K ex-rent). */
export const MAX_MONTHLY_EXPENSES = 50_000;

/** Max monthly rent (premium TLV 3BR ~₪18K; headroom to ₪25K). */
export const MAX_MONTHLY_RENT = 25_000;

/** LTV thresholds for gauge and sidebar styling. */
export const LTV_GOOD_MAX = 60;
export const LTV_WARN_MAX = 80;

/** Semi-liquid assets count at this fraction toward liquid total. */
export const SEMI_LIQUID_FACTOR = 0.7;

/** Recharts animation duration (ms). */
export const CHART_ANIMATION_MS = 800;

/** Remaining liquid below this triggers amber warning in mortgage summary. */
export const LOW_LIQUID_WARNING = 100_000;

/** Simulation timeline origin. */
export const START_YEAR = 2026;
export const START_MONTH = 5;
