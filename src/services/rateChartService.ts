import {
  RateChartRule,
  RateChartHistoryEntry,
  RateChartDetailedChange,
  MilkRateParameters,
  VolumeBonusSlab,
  QualityIncentivesConfig,
  QualityDeductionsConfig,
  CompetitorRateConfig,
  MilkCalculationResult,
} from '../types/rateChart';
import { ActivityService } from './activityService';

const STORAGE_KEY_RATE_CHART = 'dairy_master_rate_chart';
const STORAGE_KEY_RATE_HISTORY = 'dairy_rate_chart_history';

export const DEFAULT_RATE_CHART: RateChartRule = {
  id: 'RC-MASTER-DEFAULT',
  version: 1,
  versionTag: 'RC-2026.08-v1',
  effectiveDate: '2026-08-01',
  effectiveTime: '06:00',
  cowRateConfig: {
    baseRate: 38.0,
    baseFat: 3.5,
    baseSnf: 8.5,
    minFat: 3.0,
    maxFat: 5.5,
    minSnf: 7.5,
    maxSnf: 9.5,
    fatIncrStep: 0.30,
    fatDecrStep: 0.35,
    snfIncrStep: 0.25,
    snfDecrStep: 0.30,
    tsRatePerKg: 310.0,
    fatRatePerKg: 450.0,
    snfRatePerKg: 260.0,
    incentivePerLitre: 1.50,
    bonusPerLitre: 1.00,
  },
  buffaloRateConfig: {
    baseRate: 68.0,
    baseFat: 6.0,
    baseSnf: 9.0,
    minFat: 5.0,
    maxFat: 10.0,
    minSnf: 8.0,
    maxSnf: 10.5,
    fatIncrStep: 0.50,
    fatDecrStep: 0.60,
    snfIncrStep: 0.35,
    snfDecrStep: 0.40,
    tsRatePerKg: 420.0,
    fatRatePerKg: 620.0,
    snfRatePerKg: 340.0,
    incentivePerLitre: 2.00,
    bonusPerLitre: 1.50,
  },
  volumeSlabs: [
    { id: 'slab-1', minLitres: 0, maxLitres: 100, bonusPerLitre: 0.0, slabName: 'प्रमाणित संकलन (0-100L)' },
    { id: 'slab-2', minLitres: 101, maxLitres: 300, bonusPerLitre: 0.50, slabName: 'मध्यम संकलन बोनस (101-300L)' },
    { id: 'slab-3', minLitres: 301, maxLitres: 600, bonusPerLitre: 1.00, slabName: 'मोठे संकलन बोनस (301-600L)' },
    { id: 'slab-4', minLitres: 601, maxLitres: 99999, bonusPerLitre: 1.50, slabName: 'बल्क सप्लायर प्रीमियम (>600L)' },
  ],
  qualityIncentives: {
    cleanlinessBonus: 0.50,
    coolingChillingBonus: 0.75,
    organicA2Bonus: 2.00,
    timelyDeliveryBonus: 0.30,
    festivalBonus: 1.00,
    animalCareIncentive: 0.20,
  },
  deductions: {
    transportChargePerLitre: 0.50,
    transportChargePerKm: 0.0,
    coolingChargePerLitre: 0.25,
    highAcidityDeduction: 1.50,
    waterAdulterationPenalty: 5.00,
    cattleFeedLevyPerLitre: 0.20,
    testingFeePerSample: 0.0,
  },
  competitorConfig: {
    competitorName: 'स्थानिक खाजगी डेअरी (Competitor Dairy)',
    cowBaseRate: 37.0,
    cowBaseFat: 3.5,
    cowBaseSnf: 8.5,
    buffaloBaseRate: 66.0,
    buffaloBaseFat: 6.0,
    buffaloBaseSnf: 9.0,
    cowIncentive: 0.50,
    buffaloIncentive: 1.00,
    notes: 'स्थानिक प्रतिस्पर्धी दर तुलना संदर्भ',
  },
  calculationFormula: 'standard_step',
  notes: 'प्रमाणित महाराष्ट्र डेअरी महामंडळ व सहकारी संघ दर तक्ता',
  isActive: true,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  updatedBy: {
    id: 'ADMIN-001',
    name: 'प्रमोद पाटील (Admin)',
    role: 'admin',
    mobile: '9822011223',
    email: 'admin@dairy.com',
  },
  changeReason: 'प्रारंभिक प्रमाणित दर पत्रक संरचना (Initial Setup)',
};

export class RateChartService {
  private static cachedRateChart: RateChartRule | null = null;
  private static isInitialized = false;

  /**
   * Initializes rate chart from server API or local storage
   */
  public static async init(): Promise<RateChartRule> {
    if (this.isInitialized && this.cachedRateChart) {
      return this.cachedRateChart;
    }

    try {
      // 1. First check local storage for instant render
      const local = localStorage.getItem(STORAGE_KEY_RATE_CHART);
      if (local) {
        try {
          this.cachedRateChart = JSON.parse(local);
        } catch {
          // fallback
        }
      }

      // 2. Fetch latest authoritative master from server
      const response = await fetch('/api/rate-chart');
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.rateChart) {
          this.cachedRateChart = json.rateChart;
          localStorage.setItem(STORAGE_KEY_RATE_CHART, JSON.stringify(this.cachedRateChart));
        }
      }
    } catch (err) {
      console.warn('Network fetch for rate chart failed, using local/default:', err);
    }

    if (!this.cachedRateChart) {
      this.cachedRateChart = DEFAULT_RATE_CHART;
      localStorage.setItem(STORAGE_KEY_RATE_CHART, JSON.stringify(DEFAULT_RATE_CHART));
    }

    this.isInitialized = true;
    return this.cachedRateChart;
  }

  /**
   * Synchronously get the active Rate Chart configuration
   */
  public static getActiveRateChart(): RateChartRule {
    if (this.cachedRateChart) return this.cachedRateChart;
    try {
      const local = localStorage.getItem(STORAGE_KEY_RATE_CHART);
      if (local) {
        this.cachedRateChart = JSON.parse(local);
        return this.cachedRateChart!;
      }
    } catch {
      // fallback
    }
    this.cachedRateChart = DEFAULT_RATE_CHART;
    return DEFAULT_RATE_CHART;
  }

  /**
   * Get complete version change history
   */
  public static getHistory(): RateChartHistoryEntry[] {
    try {
      const local = localStorage.getItem(STORAGE_KEY_RATE_HISTORY);
      if (local) {
        return JSON.parse(local);
      }
    } catch (err) {
      console.error('Error loading rate history:', err);
    }

    // Default initial history item
    const initialHistory: RateChartHistoryEntry = {
      id: 'RCH-1',
      rateChartId: DEFAULT_RATE_CHART.id,
      version: 1,
      versionTag: 'RC-2026.08-v1',
      effectiveDate: '2026-08-01',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      time: '06:00',
      updatedBy: DEFAULT_RATE_CHART.updatedBy,
      changeReason: 'प्रारंभिक प्रमाणित दर पत्रक संरचना (Initial Base Configuration)',
      diffSummary: ['प्रारंभिक दर रचना लागू: गाय बेस ₹38.00 / म्हैस बेस ₹68.00'],
      snapshot: DEFAULT_RATE_CHART,
    };
    localStorage.setItem(STORAGE_KEY_RATE_HISTORY, JSON.stringify([initialHistory]));
    return [initialHistory];
  }

  /**
   * Save updated Rate Chart permanently with Version Control & Confirmation
   */
  public static async saveRateChart(
    newConfig: RateChartRule,
    updatedBy: { id: string; name: string; role: string; mobile?: string; email?: string },
    reason: string
  ): Promise<{ success: boolean; rateChart: RateChartRule; historyEntry: RateChartHistoryEntry }> {
    const current = this.getActiveRateChart();
    const newVersion = (current.version || 1) + 1;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const versionTag = `RC-${todayStr.replace(/-/g, '.')}-v${newVersion}`;

    // Compute diff summary and detailed changes between old and new
    const diffs = this.computeDiff(current, newConfig);
    const detailedChanges = this.computeDetailedChanges(current, newConfig);

    const updatedRule: RateChartRule = {
      ...newConfig,
      id: `RC-MASTER-${Date.now()}`,
      version: newVersion,
      versionTag,
      effectiveDate: newConfig.effectiveDate || todayStr,
      effectiveTime: newConfig.effectiveTime || timeStr,
      updatedAt: new Date().toISOString(),
      updatedBy,
      changeReason: reason || 'दर पत्रक नियमित अद्ययावतीकरण',
      isActive: true,
    };

    // Create history entry with detailed audit tracking
    const historyEntry: RateChartHistoryEntry = {
      id: `RCH-${Date.now()}`,
      rateChartId: updatedRule.id,
      version: newVersion,
      versionTag,
      effectiveDate: updatedRule.effectiveDate,
      timestamp: new Date().toISOString(),
      date: todayStr,
      time: timeStr,
      userAction: 'RATE_CHART_UPDATE',
      updatedBy,
      changeReason: reason || 'दर पत्रक बदल',
      diffSummary: diffs.length > 0 ? diffs : ['दर पत्रक मापदंड अद्ययावत केले'],
      detailedChanges,
      snapshot: updatedRule,
      previousSnapshot: current,
    };

    // Update Cache & LocalStorage
    this.cachedRateChart = updatedRule;
    localStorage.setItem(STORAGE_KEY_RATE_CHART, JSON.stringify(updatedRule));

    const history = this.getHistory();
    const newHistory = [historyEntry, ...history];
    localStorage.setItem(STORAGE_KEY_RATE_HISTORY, JSON.stringify(newHistory));

    // Send to Server Backend for durable persistence
    try {
      await fetch('/api/rate-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rateChart: updatedRule,
          historyEntry,
        }),
      });
    } catch (err) {
      console.warn('Could not post rate-chart to server immediately, saved locally:', err);
    }

    // Log Activity for Audit Trail
    ActivityService.trackActivity({
      activityType: 'info_edited',
      title: `दर पत्रक बदलले (Version ${versionTag})`,
      description: `दर पत्रक आवृत्ती ${versionTag} सेव्ह केली. कारण: ${reason}. बदल: ${diffs.join(', ')}`,
      entityType: 'report',
      entityName: `Rate Chart v${newVersion}`,
    }).catch(e => console.warn('Activity logging error:', e));

    // Notify all app components & tabs
    this.broadcastUpdate(updatedRule);

    return {
      success: true,
      rateChart: updatedRule,
      historyEntry,
    };
  }

  /**
   * Restore any previous historical version (Admin only)
   */
  public static async restoreVersion(
    versionToRestore: number,
    adminUser: { id: string; name: string; role: string; mobile?: string }
  ): Promise<{ success: boolean; rateChart: RateChartRule }> {
    const history = this.getHistory();
    const targetEntry = history.find(h => h.version === versionToRestore);

    if (!targetEntry || !targetEntry.snapshot) {
      throw new Error(`आवृत्ती क्रमांक v${versionToRestore} सापडली नाही.`);
    }

    const current = this.getActiveRateChart();
    const newVersion = (current.version || 1) + 1;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);
    const versionTag = `RC-${todayStr.replace(/-/g, '.')}-v${newVersion}`;

    const restoredRule: RateChartRule = {
      ...targetEntry.snapshot,
      id: `RC-RESTORED-${Date.now()}`,
      version: newVersion,
      versionTag,
      effectiveDate: todayStr,
      effectiveTime: timeStr,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser,
      changeReason: `आवृत्ती v${versionToRestore} वरून पूर्ववत (Restored from Version v${versionToRestore})`,
      isActive: true,
    };

    const diffs = [
      `आवृत्ती v${versionToRestore} ची दर रचना संपूर्ण सिस्टीममध्ये पूर्ववत (Rollback) लागू केली.`,
    ];

    const historyEntry: RateChartHistoryEntry = {
      id: `RCH-${Date.now()}`,
      rateChartId: restoredRule.id,
      version: newVersion,
      versionTag,
      effectiveDate: todayStr,
      timestamp: new Date().toISOString(),
      date: todayStr,
      time: timeStr,
      userAction: 'VERSION_RESTORE',
      updatedBy: adminUser,
      changeReason: `आवृत्ती v${versionToRestore} वरून पूर्ववत (Rollback to v${versionToRestore})`,
      diffSummary: diffs,
      snapshot: restoredRule,
      previousSnapshot: current,
      restoredFromVersion: versionToRestore,
    };

    this.cachedRateChart = restoredRule;
    localStorage.setItem(STORAGE_KEY_RATE_CHART, JSON.stringify(restoredRule));

    const newHistory = [historyEntry, ...history];
    localStorage.setItem(STORAGE_KEY_RATE_HISTORY, JSON.stringify(newHistory));

    // Send to Server
    try {
      await fetch('/api/rate-chart/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rateChart: restoredRule,
          historyEntry,
          restoredFromVersion: versionToRestore,
        }),
      });
    } catch (err) {
      console.warn('Server restore sync failed:', err);
    }

    ActivityService.trackActivity({
      activityType: 'data_restored',
      title: `दर पत्रक पूर्ववत (Restored to v${versionToRestore})`,
      description: `दर पत्रक आवृत्ती v${versionToRestore} यशस्वीरीत्या रिस्टोअर केली (नवीन आवृत्ती v${newVersion})`,
      entityType: 'report',
      entityName: `Rate Chart v${newVersion}`,
    }).catch(e => console.warn('Activity logging error:', e));

    this.broadcastUpdate(restoredRule);

    return {
      success: true,
      rateChart: restoredRule,
    };
  }

  /**
   * Broadcast update across application and browser storage events
   */
  private static broadcastUpdate(rule: RateChartRule) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dairy_rate_chart_updated', { detail: rule }));
    }
  }

  /**
   * Computes granular field-by-field changes for audit trails
   */
  public static computeDetailedChanges(oldRule: RateChartRule, newRule: RateChartRule): RateChartDetailedChange[] {
    const changes: RateChartDetailedChange[] = [];

    // Cow Rate Config
    const cowFields: Array<{ key: keyof MilkRateParameters; label: string }> = [
      { key: 'baseRate', label: 'गाय बेस दर (Base Rate ₹/L)' },
      { key: 'baseFat', label: 'गाय बेस फॅट (Base Fat %)' },
      { key: 'baseSnf', label: 'गाय बेस SNF (Base SNF %)' },
      { key: 'fatIncrStep', label: 'गाय फॅट वाढ दर (Fat Incr ₹/0.1%)' },
      { key: 'fatDecrStep', label: 'गाय फॅट कपात दर (Fat Decr ₹/0.1%)' },
      { key: 'snfIncrStep', label: 'गाय SNF वाढ दर (SNF Incr ₹/0.1%)' },
      { key: 'snfDecrStep', label: 'गाय SNF कपात दर (SNF Decr ₹/0.1%)' },
      { key: 'minFat', label: 'गाय किमान फॅट (Min Fat %)' },
      { key: 'maxFat', label: 'गाय कमाल फॅट (Max Fat %)' },
      { key: 'minSnf', label: 'गाय किमान SNF (Min SNF %)' },
      { key: 'maxSnf', label: 'गाय कमाल SNF (Max SNF %)' },
      { key: 'incentivePerLitre', label: 'गाय शासकीय/विशेष अनुदान (Incentive ₹/L)' },
      { key: 'bonusPerLitre', label: 'गाय सण/हंगामी बोनस (Bonus ₹/L)' },
    ];

    for (const f of cowFields) {
      if (oldRule.cowRateConfig[f.key] !== newRule.cowRateConfig[f.key]) {
        changes.push({
          fieldName: `cow.${f.key}`,
          fieldLabel: f.label,
          previousValue: oldRule.cowRateConfig[f.key] ?? 0,
          newValue: newRule.cowRateConfig[f.key] ?? 0,
          category: 'cow',
        });
      }
    }

    // Buffalo Rate Config
    const buffaloFields: Array<{ key: keyof MilkRateParameters; label: string }> = [
      { key: 'baseRate', label: 'म्हैस बेस दर (Base Rate ₹/L)' },
      { key: 'baseFat', label: 'म्हैस बेस फॅट (Base Fat %)' },
      { key: 'baseSnf', label: 'म्हैस बेस SNF (Base SNF %)' },
      { key: 'fatIncrStep', label: 'म्हैस फॅट वाढ दर (Fat Incr ₹/0.1%)' },
      { key: 'fatDecrStep', label: 'म्हैस फॅट कपात दर (Fat Decr ₹/0.1%)' },
      { key: 'snfIncrStep', label: 'म्हैस SNF वाढ दर (SNF Incr ₹/0.1%)' },
      { key: 'snfDecrStep', label: 'म्हैस SNF कपात दर (SNF Decr ₹/0.1%)' },
      { key: 'minFat', label: 'म्हैस किमान फॅट (Min Fat %)' },
      { key: 'maxFat', label: 'म्हैस कमाल फॅट (Max Fat %)' },
      { key: 'minSnf', label: 'म्हैस किमान SNF (Min SNF %)' },
      { key: 'maxSnf', label: 'म्हैस कमाल SNF (Max SNF %)' },
      { key: 'incentivePerLitre', label: 'म्हैस शासकीय/विशेष अनुदान (Incentive ₹/L)' },
      { key: 'bonusPerLitre', label: 'म्हैस सण/हंगामी बोनस (Bonus ₹/L)' },
    ];

    for (const f of buffaloFields) {
      if (oldRule.buffaloRateConfig[f.key] !== newRule.buffaloRateConfig[f.key]) {
        changes.push({
          fieldName: `buffalo.${f.key}`,
          fieldLabel: f.label,
          previousValue: oldRule.buffaloRateConfig[f.key] ?? 0,
          newValue: newRule.buffaloRateConfig[f.key] ?? 0,
          category: 'buffalo',
        });
      }
    }

    // Quality Incentives
    const incentiveFields: Array<{ key: keyof QualityIncentivesConfig; label: string }> = [
      { key: 'cleanlinessBonus', label: 'स्वच्छता प्रोत्साहन (Cleanliness Bonus ₹/L)' },
      { key: 'coolingChillingBonus', label: 'चिलिंग/शीतकरण प्रोत्साहन (Cooling Bonus ₹/L)' },
      { key: 'organicA2Bonus', label: 'सेंद्रिय / A2 प्रोत्साहन (Organic/A2 ₹/L)' },
      { key: 'timelyDeliveryBonus', label: 'वेळेत दूध आणल्यास प्रोत्साहन (Timely Delivery ₹/L)' },
      { key: 'festivalBonus', label: 'सण/हंगामी प्रोत्साहन (Festival Bonus ₹/L)' },
      { key: 'animalCareIncentive', label: 'पशुसंवर्धन व लसीकरण प्रोत्साहन (Animal Care ₹/L)' },
    ];

    for (const f of incentiveFields) {
      if (oldRule.qualityIncentives[f.key] !== newRule.qualityIncentives[f.key]) {
        changes.push({
          fieldName: `incentive.${f.key}`,
          fieldLabel: f.label,
          previousValue: oldRule.qualityIncentives[f.key] ?? 0,
          newValue: newRule.qualityIncentives[f.key] ?? 0,
          category: 'incentives',
        });
      }
    }

    // Deductions
    const deductionFields: Array<{ key: keyof QualityDeductionsConfig; label: string }> = [
      { key: 'transportChargePerLitre', label: 'वाहतूक कपात (Transport ₹/L)' },
      { key: 'transportChargePerKm', label: 'वाहतूक कपात (Transport ₹/Km)' },
      { key: 'coolingChargePerLitre', label: 'बीएमसी मेंटेनन्स (Cooling Charge ₹/L)' },
      { key: 'highAcidityDeduction', label: 'आंबट दूध दंड (Acidity Penalty ₹/L)' },
      { key: 'waterAdulterationPenalty', label: 'भेसळ दंड (Adulteration Penalty ₹/L)' },
      { key: 'cattleFeedLevyPerLitre', label: 'पशुखाद्य लेव्ही (Cattle Feed Levy ₹/L)' },
      { key: 'testingFeePerSample', label: 'नमुना चाचणी शुल्क (Testing Fee ₹/Sample)' },
    ];

    for (const f of deductionFields) {
      if (oldRule.deductions[f.key] !== newRule.deductions[f.key]) {
        changes.push({
          fieldName: `deduction.${f.key}`,
          fieldLabel: f.label,
          previousValue: oldRule.deductions[f.key] ?? 0,
          newValue: newRule.deductions[f.key] ?? 0,
          category: 'deductions',
        });
      }
    }

    return changes;
  }

  /**
   * Computes human-readable diff list between two rate chart rules
   */
  public static computeDiff(oldRule: RateChartRule, newRule: RateChartRule): string[] {
    const diffs: string[] = [];

    // Cow Rates Diff
    if (oldRule.cowRateConfig.baseRate !== newRule.cowRateConfig.baseRate) {
      diffs.push(`गाय बेस दर: ₹${oldRule.cowRateConfig.baseRate} → ₹${newRule.cowRateConfig.baseRate}`);
    }
    if (oldRule.cowRateConfig.baseFat !== newRule.cowRateConfig.baseFat) {
      diffs.push(`गाय बेस फॅट: ${oldRule.cowRateConfig.baseFat}% → ${newRule.cowRateConfig.baseFat}%`);
    }
    if (oldRule.cowRateConfig.baseSnf !== newRule.cowRateConfig.baseSnf) {
      diffs.push(`गाय बेस SNF: ${oldRule.cowRateConfig.baseSnf}% → ${newRule.cowRateConfig.baseSnf}%`);
    }
    if (oldRule.cowRateConfig.fatIncrStep !== newRule.cowRateConfig.fatIncrStep) {
      diffs.push(`गाय फॅट वाढ: ₹${oldRule.cowRateConfig.fatIncrStep} → ₹${newRule.cowRateConfig.fatIncrStep}`);
    }
    if (oldRule.cowRateConfig.fatDecrStep !== newRule.cowRateConfig.fatDecrStep) {
      diffs.push(`गाय फॅट कपात: ₹${oldRule.cowRateConfig.fatDecrStep} → ₹${newRule.cowRateConfig.fatDecrStep}`);
    }
    if (oldRule.cowRateConfig.incentivePerLitre !== newRule.cowRateConfig.incentivePerLitre) {
      diffs.push(`गाय प्रोत्साहन: ₹${oldRule.cowRateConfig.incentivePerLitre} → ₹${newRule.cowRateConfig.incentivePerLitre}`);
    }

    // Buffalo Rates Diff
    if (oldRule.buffaloRateConfig.baseRate !== newRule.buffaloRateConfig.baseRate) {
      diffs.push(`म्हैस बेस दर: ₹${oldRule.buffaloRateConfig.baseRate} → ₹${newRule.buffaloRateConfig.baseRate}`);
    }
    if (oldRule.buffaloRateConfig.baseFat !== newRule.buffaloRateConfig.baseFat) {
      diffs.push(`म्हैस बेस फॅट: ${oldRule.buffaloRateConfig.baseFat}% → ${newRule.buffaloRateConfig.baseFat}%`);
    }
    if (oldRule.buffaloRateConfig.baseSnf !== newRule.buffaloRateConfig.baseSnf) {
      diffs.push(`म्हैस बेस SNF: ${oldRule.buffaloRateConfig.baseSnf}% → ${newRule.buffaloRateConfig.baseSnf}%`);
    }
    if (oldRule.buffaloRateConfig.fatIncrStep !== newRule.buffaloRateConfig.fatIncrStep) {
      diffs.push(`म्हैस फॅट वाढ: ₹${oldRule.buffaloRateConfig.fatIncrStep} → ₹${newRule.buffaloRateConfig.fatIncrStep}`);
    }
    if (oldRule.buffaloRateConfig.fatDecrStep !== newRule.buffaloRateConfig.fatDecrStep) {
      diffs.push(`म्हैस फॅट कपात: ₹${oldRule.buffaloRateConfig.fatDecrStep} → ₹${newRule.buffaloRateConfig.fatDecrStep}`);
    }
    if (oldRule.buffaloRateConfig.incentivePerLitre !== newRule.buffaloRateConfig.incentivePerLitre) {
      diffs.push(`म्हैस प्रोत्साहन: ₹${oldRule.buffaloRateConfig.incentivePerLitre} → ₹${newRule.buffaloRateConfig.incentivePerLitre}`);
    }

    // Quality Incentives Diff
    if (oldRule.qualityIncentives.cleanlinessBonus !== newRule.qualityIncentives.cleanlinessBonus) {
      diffs.push(`स्वच्छता बोनस: ₹${oldRule.qualityIncentives.cleanlinessBonus} → ₹${newRule.qualityIncentives.cleanlinessBonus}`);
    }
    if (oldRule.qualityIncentives.coolingChillingBonus !== newRule.qualityIncentives.coolingChillingBonus) {
      diffs.push(`कूलिंग बोनस: ₹${oldRule.qualityIncentives.coolingChillingBonus} → ₹${newRule.qualityIncentives.coolingChillingBonus}`);
    }
    if (oldRule.qualityIncentives.festivalBonus !== newRule.qualityIncentives.festivalBonus) {
      diffs.push(`सण/हंगामी बोनस: ₹${oldRule.qualityIncentives.festivalBonus} → ₹${newRule.qualityIncentives.festivalBonus}`);
    }

    // Deductions Diff
    if (oldRule.deductions.transportChargePerLitre !== newRule.deductions.transportChargePerLitre) {
      diffs.push(`वाहतूक कपात: ₹${oldRule.deductions.transportChargePerLitre} → ₹${newRule.deductions.transportChargePerLitre}`);
    }
    if (oldRule.deductions.cattleFeedLevyPerLitre !== newRule.deductions.cattleFeedLevyPerLitre) {
      diffs.push(`पशुखाद्य लेव्ही: ₹${oldRule.deductions.cattleFeedLevyPerLitre} → ₹${newRule.deductions.cattleFeedLevyPerLitre}`);
    }

    return diffs;
  }

  /**
   * System-Wide Rate Calculation Engine
   * Dynamically applies active Rate Chart formulas and slabs
   */
  public static calculateMilkRate(
    milkType: 'Cow' | 'Buffalo',
    fat: number,
    snf: number,
    litres: number = 1,
    options?: {
      includeIncentive?: boolean;
      appliedIncentives?: {
        cleanliness?: boolean;
        cooling?: boolean;
        organicA2?: boolean;
        timelyDelivery?: boolean;
        festival?: boolean;
        animalCare?: boolean;
      };
      appliedDeductions?: {
        transport?: boolean;
        coolingCharge?: boolean;
        highAcidity?: boolean;
        waterAdulteration?: boolean;
        cattleFeedLevy?: boolean;
      };
      customRateChart?: RateChartRule;
    }
  ): MilkCalculationResult {
    const chart = options?.customRateChart || this.getActiveRateChart();
    const config = milkType === 'Cow' ? chart.cowRateConfig : chart.buffaloRateConfig;

    const baseRate = config.baseRate;
    const baseFat = config.baseFat;
    const baseSnf = config.baseSnf;

    // Points difference (1 point = 0.1% change)
    const fatDiffPoints = Math.round((fat - baseFat) * 10);
    const snfDiffPoints = Math.round((snf - baseSnf) * 10);

    // Fat Adjustment
    const fatAdjustment =
      fatDiffPoints >= 0
        ? Number((fatDiffPoints * config.fatIncrStep).toFixed(3))
        : Number((fatDiffPoints * config.fatDecrStep).toFixed(3));

    // SNF Adjustment
    const snfAdjustment =
      snfDiffPoints >= 0
        ? Number((snfDiffPoints * config.snfIncrStep).toFixed(3))
        : Number((snfDiffPoints * config.snfDecrStep).toFixed(3));

    // Volume Slab Bonus
    let volumeBonus = 0;
    let appliedSlab: VolumeBonusSlab | undefined;
    if (chart.volumeSlabs && chart.volumeSlabs.length > 0) {
      for (const slab of chart.volumeSlabs) {
        if (litres >= slab.minLitres && litres <= slab.maxLitres) {
          volumeBonus = slab.bonusPerLitre;
          appliedSlab = slab;
          break;
        }
      }
    }

    // Base Incentive
    const baseIncentive = (options?.includeIncentive ?? true) ? config.incentivePerLitre : 0;

    // Quality Incentives Breakdown
    const incentivesBreakdown: { name: string; amount: number }[] = [];
    let qualityIncentivesTotal = 0;

    if (options?.appliedIncentives?.cleanliness && chart.qualityIncentives.cleanlinessBonus > 0) {
      incentivesBreakdown.push({ name: 'स्वच्छ दूध बोनस', amount: chart.qualityIncentives.cleanlinessBonus });
      qualityIncentivesTotal += chart.qualityIncentives.cleanlinessBonus;
    }
    if (options?.appliedIncentives?.cooling && chart.qualityIncentives.coolingChillingBonus > 0) {
      incentivesBreakdown.push({ name: 'शीतकरण/BMC बोनस', amount: chart.qualityIncentives.coolingChillingBonus });
      qualityIncentivesTotal += chart.qualityIncentives.coolingChillingBonus;
    }
    if (options?.appliedIncentives?.organicA2 && chart.qualityIncentives.organicA2Bonus > 0) {
      incentivesBreakdown.push({ name: 'A2 / देशी गाय प्रीमियम', amount: chart.qualityIncentives.organicA2Bonus });
      qualityIncentivesTotal += chart.qualityIncentives.organicA2Bonus;
    }
    if (options?.appliedIncentives?.timelyDelivery && chart.qualityIncentives.timelyDeliveryBonus > 0) {
      incentivesBreakdown.push({ name: 'वेळेवर संकलन बोनस', amount: chart.qualityIncentives.timelyDeliveryBonus });
      qualityIncentivesTotal += chart.qualityIncentives.timelyDeliveryBonus;
    }
    if (options?.appliedIncentives?.festival && chart.qualityIncentives.festivalBonus > 0) {
      incentivesBreakdown.push({ name: 'सण/हंगामी प्रोत्साहन', amount: chart.qualityIncentives.festivalBonus });
      qualityIncentivesTotal += chart.qualityIncentives.festivalBonus;
    }
    if (options?.appliedIncentives?.animalCare && chart.qualityIncentives.animalCareIncentive > 0) {
      incentivesBreakdown.push({ name: 'लसीकरण/टॅग प्रोत्साहन', amount: chart.qualityIncentives.animalCareIncentive });
      qualityIncentivesTotal += chart.qualityIncentives.animalCareIncentive;
    }

    // Deductions Breakdown
    const deductionsBreakdown: { name: string; amount: number }[] = [];
    let deductionsTotal = 0;

    if (options?.appliedDeductions?.transport && chart.deductions.transportChargePerLitre > 0) {
      deductionsBreakdown.push({ name: 'वाहतूक खर्च कपात', amount: chart.deductions.transportChargePerLitre });
      deductionsTotal += chart.deductions.transportChargePerLitre;
    }
    if (options?.appliedDeductions?.coolingCharge && chart.deductions.coolingChargePerLitre > 0) {
      deductionsBreakdown.push({ name: 'BMC देखभाल कपात', amount: chart.deductions.coolingChargePerLitre });
      deductionsTotal += chart.deductions.coolingChargePerLitre;
    }
    if (options?.appliedDeductions?.highAcidity && chart.deductions.highAcidityDeduction > 0) {
      deductionsBreakdown.push({ name: 'जादा आम्लता दंड', amount: chart.deductions.highAcidityDeduction });
      deductionsTotal += chart.deductions.highAcidityDeduction;
    }
    if (options?.appliedDeductions?.waterAdulteration && chart.deductions.waterAdulterationPenalty > 0) {
      deductionsBreakdown.push({ name: 'पाणी भेसळ दंड', amount: chart.deductions.waterAdulterationPenalty });
      deductionsTotal += chart.deductions.waterAdulterationPenalty;
    }
    if (options?.appliedDeductions?.cattleFeedLevy && chart.deductions.cattleFeedLevyPerLitre > 0) {
      deductionsBreakdown.push({ name: 'पशुखाद्य लेव्ही कपात', amount: chart.deductions.cattleFeedLevyPerLitre });
      deductionsTotal += chart.deductions.cattleFeedLevyPerLitre;
    }

    // Net Rate per Litre
    const netRatePerLitre = Math.max(
      0,
      Number(
        (
          baseRate +
          fatAdjustment +
          snfAdjustment +
          baseIncentive +
          volumeBonus +
          qualityIncentivesTotal -
          deductionsTotal
        ).toFixed(2)
      )
    );

    const grossAmount = Number((netRatePerLitre * litres).toFixed(2));
    const netAmount = grossAmount;

    return {
      milkType,
      litres,
      fat,
      snf,
      baseRate,
      baseFat,
      baseSnf,
      fatDiffPoints,
      snfDiffPoints,
      fatAdjustment,
      snfAdjustment,
      volumeBonus,
      qualityIncentivesTotal,
      deductionsTotal,
      baseIncentive,
      netRatePerLitre,
      grossAmount,
      netAmount,
      appliedSlab,
      incentivesBreakdown,
      deductionsBreakdown,
    };
  }
}
