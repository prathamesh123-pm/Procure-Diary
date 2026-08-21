export interface MilkRateParameters {
  baseRate: number; // Base rate in ₹ per Litre (e.g. 38.00)
  baseFat: number; // Base Fat % (e.g. 3.5)
  baseSnf: number; // Base SNF % (e.g. 8.5)
  minFat: number; // Minimum acceptable Fat % (e.g. 3.0)
  maxFat: number; // Maximum Fat % (e.g. 5.5)
  minSnf: number; // Minimum acceptable SNF % (e.g. 7.5)
  maxSnf: number; // Maximum SNF % (e.g. 9.5)
  fatIncrStep: number; // ₹ increase per +0.1% Fat (e.g. 0.30)
  fatDecrStep: number; // ₹ deduction per -0.1% Fat (e.g. 0.35)
  snfIncrStep: number; // ₹ increase per +0.1% SNF (e.g. 0.25)
  snfDecrStep: number; // ₹ deduction per -0.1% SNF (e.g. 0.30)
  tsRatePerKg?: number; // Total Solids Rate in ₹/Kg
  fatRatePerKg?: number; // Fat Rate in ₹/Kg
  snfRatePerKg?: number; // SNF Rate in ₹/Kg
  incentivePerLitre: number; // Base Incentive / प्रोत्साहन अनुदानात वाढ (e.g. 1.50)
  bonusPerLitre: number; // Base Festival/Special Bonus (e.g. 1.00)
}

export interface VolumeBonusSlab {
  id: string;
  minLitres: number;
  maxLitres: number;
  bonusPerLitre: number;
  slabName: string;
}

export interface QualityIncentivesConfig {
  cleanlinessBonus: number; // ₹/L for clean milk / low MBRT
  coolingChillingBonus: number; // ₹/L for prompt chilled delivery (<10°C)
  organicA2Bonus: number; // ₹/L for A2 / Desi cow milk
  timelyDeliveryBonus: number; // ₹/L for delivery before 7:30 AM / 6:30 PM
  festivalBonus: number; // ₹/L seasonal / festive rate top-up
  animalCareIncentive: number; // ₹/L vaccinated / tagged herd incentive
}

export interface QualityDeductionsConfig {
  transportChargePerLitre: number; // ₹/L transport deduction
  transportChargePerKm: number; // ₹/Km for long distance routes
  coolingChargePerLitre: number; // ₹/L BMC maintenance deduction
  highAcidityDeduction: number; // ₹/L penalty for acidity > 0.15%
  waterAdulterationPenalty: number; // ₹/L penalty for detected water addition
  cattleFeedLevyPerLitre: number; // ₹/L deduction towards society feed fund
  testingFeePerSample: number; // ₹ per test slip
}

export interface CompetitorRateConfig {
  competitorName: string;
  cowBaseRate: number;
  cowBaseFat: number;
  cowBaseSnf: number;
  buffaloBaseRate: number;
  buffaloBaseFat: number;
  buffaloBaseSnf: number;
  cowIncentive: number;
  buffaloIncentive: number;
  notes?: string;
}

export interface RateChartRule {
  id: string;
  version: number;
  versionTag: string; // e.g. "RC-2026.08-v1"
  effectiveDate: string; // e.g. "2026-08-01"
  effectiveTime?: string; // e.g. "06:00"
  cowRateConfig: MilkRateParameters;
  buffaloRateConfig: MilkRateParameters;
  volumeSlabs: VolumeBonusSlab[];
  qualityIncentives: QualityIncentivesConfig;
  deductions: QualityDeductionsConfig;
  competitorConfig: CompetitorRateConfig;
  calculationFormula: 'standard_step' | 'ts_based' | 'flat_quality';
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: {
    id: string;
    name: string;
    role: string;
    mobile?: string;
    email?: string;
  };
  changeReason: string;
}

export interface RateChartDetailedChange {
  fieldName: string;
  fieldLabel: string;
  previousValue: string | number;
  newValue: string | number;
  category: 'cow' | 'buffalo' | 'slabs' | 'incentives' | 'deductions' | 'general';
}

export interface RateChartHistoryEntry {
  id: string;
  rateChartId: string;
  version: number;
  versionTag: string;
  effectiveDate: string;
  timestamp: string;
  date: string;
  time: string;
  userAction?: string;
  updatedBy: {
    id: string;
    name: string;
    role: string;
    mobile?: string;
    email?: string;
  };
  changeReason: string;
  diffSummary: string[];
  detailedChanges?: RateChartDetailedChange[];
  snapshot: RateChartRule;
  previousSnapshot?: Partial<RateChartRule>;
  restoredFromVersion?: number;
}

export interface MilkCalculationResult {
  milkType: 'Cow' | 'Buffalo';
  litres: number;
  fat: number;
  snf: number;
  baseRate: number;
  baseFat: number;
  baseSnf: number;
  fatDiffPoints: number; // 0.1% units
  snfDiffPoints: number; // 0.1% units
  fatAdjustment: number;
  snfAdjustment: number;
  volumeBonus: number;
  qualityIncentivesTotal: number;
  deductionsTotal: number;
  baseIncentive: number;
  netRatePerLitre: number;
  grossAmount: number;
  netAmount: number;
  appliedSlab?: VolumeBonusSlab;
  incentivesBreakdown: { name: string; amount: number }[];
  deductionsBreakdown: { name: string; amount: number }[];
}
