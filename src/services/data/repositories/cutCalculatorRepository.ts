import { CutRule, CutCalculation } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId, getCurrentUserId } from '../auth';
import { autoSyncEntityChange } from '../supabaseSync';
import { DEFAULT_CUT_RULES } from '../../../utils/cutCalculationEngine';

const CUT_RULES_KEY = 'smart_vidros_cut_rules_v1';
const CUT_CALCULATIONS_KEY = 'smart_vidros_cut_calculations_v1';
const CUT_CALCULATIONS_COUNTER_KEY = 'smart_vidros_cut_calc_counter_v1';

// ============================================================
// REGRAS DE CÁLCULO (ADMINISTRAÇÃO)
// ============================================================

export function getCutRules(): CutRule[] {
  const data = storageAdapter.getItem<CutRule[]>(CUT_RULES_KEY, null);
  if (!data || data.length === 0) {
    storageAdapter.setItem(CUT_RULES_KEY, DEFAULT_CUT_RULES);
    return DEFAULT_CUT_RULES;
  }
  return data;
}

export function getCutRuleById(id: string): CutRule | undefined {
  return getCutRules().find((r) => r.id === id);
}

export function saveCutRule(rule: CutRule): CutRule {
  const rules = getCutRules();
  const now = new Date().toISOString();

  const prepared: CutRule = {
    ...rule,
    id: rule.id || generateUUID(),
    companyId: rule.companyId || getCurrentCompanyId(),
    updatedAt: now,
    createdAt: rule.createdAt || now,
  };

  const index = rules.findIndex((r) => r.id === prepared.id);
  if (index >= 0) {
    rules[index] = prepared;
  } else {
    rules.unshift(prepared);
  }

  storageAdapter.setItem(CUT_RULES_KEY, rules);
  autoSyncEntityChange('cut_rules', 'upsert', prepared);
  return prepared;
}

export function deleteCutRule(id: string): void {
  const rules = getCutRules().filter((r) => r.id !== id);
  storageAdapter.setItem(CUT_RULES_KEY, rules);
  autoSyncEntityChange('cut_rules', 'delete', id);
}

export function duplicateCutRule(id: string): CutRule | undefined {
  const original = getCutRuleById(id);
  if (!original) return undefined;

  const now = new Date().toISOString();
  const duplicated: CutRule = {
    ...original,
    id: generateUUID(),
    name: `${original.name} (Cópia)`,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };

  return saveCutRule(duplicated);
}

export function resetDefaultCutRules(): CutRule[] {
  storageAdapter.setItem(CUT_RULES_KEY, DEFAULT_CUT_RULES);
  return DEFAULT_CUT_RULES;
}

// ============================================================
// MEMÓRIA DO CÁLCULO (CÁLCULOS SALVOS)
// ============================================================

export function getNextCutCalculationCode(): string {
  const currentCounter = storageAdapter.getItem<string>(CUT_CALCULATIONS_COUNTER_KEY, null);
  let counter = currentCounter ? parseInt(currentCounter, 10) : 1;
  const code = `CORTE-${String(counter).padStart(4, '0')}`;
  storageAdapter.setItem(CUT_CALCULATIONS_COUNTER_KEY, String(counter + 1));
  return code;
}

export function getCutCalculations(): CutCalculation[] {
  const data = storageAdapter.getItem<CutCalculation[]>(CUT_CALCULATIONS_KEY, null);
  if (!data) {
    storageAdapter.setItem(CUT_CALCULATIONS_KEY, []);
    return [];
  }
  return data;
}

export function getCutCalculationById(id: string): CutCalculation | undefined {
  return getCutCalculations().find((c) => c.id === id);
}

export function saveCutCalculation(calc: CutCalculation): CutCalculation {
  const list = getCutCalculations();
  const now = new Date().toISOString();

  const prepared: CutCalculation = {
    ...calc,
    id: calc.id || generateUUID(),
    code: calc.code || getNextCutCalculationCode(),
    companyId: calc.companyId || getCurrentCompanyId(),
    userId: calc.userId || getCurrentUserId(),
    updatedAt: now,
    createdAt: calc.createdAt || now,
  };

  const index = list.findIndex((c) => c.id === prepared.id);
  if (index >= 0) {
    list[index] = prepared;
  } else {
    list.unshift(prepared);
  }

  storageAdapter.setItem(CUT_CALCULATIONS_KEY, list);
  autoSyncEntityChange('cut_calculations', 'upsert', prepared);
  return prepared;
}

export function deleteCutCalculation(id: string): void {
  const list = getCutCalculations().filter((c) => c.id !== id);
  storageAdapter.setItem(CUT_CALCULATIONS_KEY, list);
  autoSyncEntityChange('cut_calculations', 'delete', id);
}

export function duplicateCutCalculation(id: string): CutCalculation | undefined {
  const original = getCutCalculationById(id);
  if (!original) return undefined;

  const now = new Date().toISOString();
  const duplicated: CutCalculation = {
    ...original,
    id: generateUUID(),
    code: getNextCutCalculationCode(),
    createdAt: now,
    updatedAt: now,
    quoteId: undefined,
    quoteCode: undefined,
    saleId: undefined,
    saleCode: undefined,
  };

  return saveCutCalculation(duplicated);
}
