export type LiquidityStatus = 'liquid' | 'semi' | 'locked';

export interface Asset {
  id: string;
  name: string;
  owner: string;
  grossAmount: number;
  taxRate: number;
  liquidity: LiquidityStatus;
  notes?: string;
}

export interface MortgageParams {
  apartmentValue: number;
  alreadyPaid: number;
  dueSoon: number;
  alreadyPaidPercent: number;
  dueSoonPercent: number;
  alreadyPaidManual: boolean;
  dueSoonManual: boolean;
  extraEquity: number;
  annualRate: number;
  termYears: number;
  entryMonthOffset: number;
}

export interface ScenarioConfig {
  id: 'a' | 'b' | 'c';
  label: string;
  incomeSource1: number;
  incomeSource1Active: boolean;
  incomeSource1StartMonth: number;
  incomeSource2: number;
  monthlyExpenses: number;
  currentRent: number;
}

export interface ChartPoint {
  month: string;
  totalAssets: number;
  mortgageBalance: number;
  netEquity: number;
  ltv: number;
}

export const HEBREW_MONTHS = [
  'ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ',
  'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ',
] as const;

export const SCENARIO_DEFAULTS: Record<'a' | 'b' | 'c', ScenarioConfig> = {
  a: {
    id: 'a',
    label: 'א׳ — הכנסה מלאה',
    incomeSource1: 0,
    incomeSource1Active: true,
    incomeSource1StartMonth: 0,
    incomeSource2: 0,
    monthlyExpenses: 0,
    currentRent: 0,
  },
  b: {
    id: 'b',
    label: 'ב׳ — הכנסה חלקית',
    incomeSource1: 0,
    incomeSource1Active: true,
    incomeSource1StartMonth: 6,
    incomeSource2: 0,
    monthlyExpenses: 0,
    currentRent: 0,
  },
  c: {
    id: 'c',
    label: 'ג׳ — הכנסה מינימלית',
    incomeSource1: 0,
    incomeSource1Active: false,
    incomeSource1StartMonth: 0,
    incomeSource2: 0,
    monthlyExpenses: 0,
    currentRent: 0,
  },
};

export interface CashTrough {
  month: string;
  value: number;
  monthIndex: number;
}

export interface AiInsightsPayload {
  assets: Asset[];
  mortgage: MortgageParams;
  scenario: ScenarioConfig;
  cashTrough: CashTrough;
  currentLtv: number;
}
