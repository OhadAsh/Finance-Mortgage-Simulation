import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Coins,
  Briefcase,
  CalendarClock,
} from 'lucide-react';
import type { Asset, ChartPoint, MortgageParams, ScenarioConfig } from '../types';
import { findCashTrough, totalLiquidNet, totalNet, mortgagePrincipal, monthlyPayment } from './calculations';
import { formatCurrency, formatPercent } from './utils';
import { SIMULATION_MONTHS } from './constants';

export type PromptCategory = 'risk' | 'optimize' | 'scenario';

export interface PromptTemplate {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: PromptCategory;
  buildPrompt: (
    assets: Asset[],
    mortgage: MortgageParams,
    simulation: ChartPoint[],
    activeScenario: ScenarioConfig,
  ) => string;
}

export const PROMPT_CATEGORY_GROUPS: { id: PromptCategory; label: string; emoji: string }[] = [
  { id: 'risk', label: 'סיכון ואזהרות', emoji: '🔴' },
  { id: 'optimize', label: 'אופטימיזציה', emoji: '📊' },
  { id: 'scenario', label: 'תרחישים', emoji: '🎭' },
];

function stateBlock(
  assets: Asset[],
  mortgage: MortgageParams,
  simulation: ChartPoint[],
  activeScenario: ScenarioConfig,
): string {
  const trough = findCashTrough(simulation);
  const latest = simulation[simulation.length - 1];
  const principal = mortgagePrincipal(mortgage);
  const payment = monthlyPayment(principal, mortgage.annualRate, mortgage.termYears);

  return `--- נתונים מהסימולטור ---
נכסים: ${JSON.stringify(assets, null, 2)}
סה"כ נטו: ${formatCurrency(totalNet(assets))} | נזיל: ${formatCurrency(totalLiquidNet(assets))}

משכנתא: ${JSON.stringify(mortgage, null, 2)}
קרן משכנתא: ${formatCurrency(principal)} | תשלום חודשי: ${formatCurrency(payment)}

תרחיש פעיל: ${activeScenario.label}
${JSON.stringify(activeScenario, null, 2)}

סימולציה (${SIMULATION_MONTHS} חודשים):
- שפל תזרים: ${trough.month} — ${formatCurrency(trough.value)}
- מצב אחרון: נכסים ${formatCurrency(latest?.totalAssets ?? 0)}, יתרת משכנתא ${formatCurrency(latest?.mortgageBalance ?? 0)}, הון עצמי נטו ${formatCurrency(latest?.netEquity ?? 0)}, LTV ${formatPercent(latest?.ltv ?? 0, 1)}`;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'risk-main',
    label: 'מה הסיכון הכי גדול?',
    description: 'ניתוח החשיפות המרכזיות בתיק',
    icon: AlertTriangle,
    category: 'risk',
    buildPrompt: (assets, mortgage, simulation, scenario) =>
      `אתה יועץ פיננסי ישראלי. נתח את הסיכון הגדול ביותר במצב הפיננסי הבא. ענה בעברית, עד 200 מילים, בנקודות.

${stateBlock(assets, mortgage, simulation, scenario)}

התמקד ב:
1. מה הסיכון הקריטי ביותר (תזרים, ריבית, LTV, חוסר נזילות)?
2. מתי הוא מתממש (חודש/אירוע)?
3. מה הסימן המוקדם שצריך לשים לב אליו?`,
  },
  {
    id: 'risk-rate',
    label: 'מה אם הריבית תעלה?',
    description: 'סימולציית עלייה של 1% בריבית',
    icon: TrendingUp,
    category: 'risk',
    buildPrompt: (assets, mortgage, simulation, scenario) =>
      `אתה יועץ פיננסי ישראלי. נתח תרחיש שבו הריבית עולה ב-1.5 נקודות אחוז מהרמה הנוכחית.

${stateBlock(assets, mortgage, simulation, scenario)}

התמקד ב:
1. כיצד תשתנה התשלום החודשי?
2. האם התזרים עדיין מאפשר לעמוד בתשלומים?
3. מה נקודת השבירה ב-LTV או בתזרים?
ענה בעברית, עד 200 מילים.`,
  },
  {
    id: 'opt-equity',
    label: 'כמה הון עצמי להוסיף?',
    description: 'המלצה מותאמת לפי נתוניך',
    icon: Coins,
    category: 'optimize',
    buildPrompt: (assets, mortgage, simulation, scenario) =>
      `אתה יועץ פיננסי ישראלי. המלץ כמה הון עצמי נוסף כדאי להוסיף מהחסכונות, בהתבסס על הנתונים.

${stateBlock(assets, mortgage, simulation, scenario)}

התמקד ב:
1. כמה הון עצמי נוסף מומלץ (טווח בש"ח)?
2. מה ה-LTV והתשלום החודשי לאחר ההוספה?
3. כמה נזילות תישאר אחרי התשלום בכניסה?
4. האם כדאי להוסיף או לשמור חוסן תזרימי?`,
  },
  {
    id: 'opt-asset',
    label: 'איזה נכס למכור ראשון?',
    description: 'סדר עדיפויות לפדיון נכסים',
    icon: BarChart3,
    category: 'optimize',
    buildPrompt: (assets, mortgage, simulation, scenario) =>
      `אתה יועץ פיננסי ישראלי. המלץ איזה נכס למכור ראשון לפדיון הון עצמי או חיזוק תזרים, בהתבסס על הנתונים.

${stateBlock(assets, mortgage, simulation, scenario)}

התמקד ב:
1. סדר עדיפויות למכירת נכסים לפי נזילות, מס וצורך
2. כמה כסף משוחרר מכל נכס?
3. מה הנזילות שנשארת אחרי?
ענה בעברית, עד 200 מילים.`,
  },
  {
    id: 'sc-nojob',
    label: 'מה אם מקור הכנסה נסגר?',
    description: 'למשך 6 חודשים — השפעה על התזרים והחסכונות',
    icon: Briefcase,
    category: 'scenario',
    buildPrompt: (assets, mortgage, simulation, scenario) =>
      `אתה יועץ פיננסי ישראלי. נתח תרחיש שבו מקור הכנסה 1 אינו פעיל למשך 6 חודשים רצופים (מקור הכנסה 2 ממשיך).

${stateBlock(assets, mortgage, simulation, scenario)}

התמקד ב:
1. האם יש מספיק נזילות ל-6 חודשים?
2. באיזה חודש התזרים הופך לשלילי?
3. מה 3 צעדים מיידיים להפחתת סיכון?
ענה בעברית, עד 200 מילים.`,
  },
  {
    id: 'sc-critical',
    label: 'מתי הנקודה הקריטית?',
    description: 'החודש בו התזרים יגיע לשפל',
    icon: CalendarClock,
    category: 'scenario',
    buildPrompt: (assets, mortgage, simulation, scenario) =>
      `אתה יועץ פיננסי ישראלי. זהה מתי מתרחשת הנקודה הקריטית בתזרים, בהתבסס על הנתונים.

${stateBlock(assets, mortgage, simulation, scenario)}

התמקד ב:
1. באיזה חודש התזרים מגיע לשפל?
2. מה גובה השפל ומה משמעותו?
3. מה לעשות לפני החודש הקריטי?
ענה בעברית, עד 200 מילים.`,
  },
];

export function buildFreeTextPrompt(
  question: string,
  assets: Asset[],
  mortgage: MortgageParams,
  simulation: ChartPoint[],
  activeScenario: ScenarioConfig,
): string {
  return `אתה יועץ פיננסי ישראלי. ענה על השאלה הבאה בעברית, בצורה תמציתית ומבוססת נתונים.

שאלת המשתמש: ${question}

${stateBlock(assets, mortgage, simulation, activeScenario)}`;
}
