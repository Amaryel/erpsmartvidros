import { Payslip, PayslipItem } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId, getCurrentUserId } from '../auth';
import { autoSyncEntityChange } from '../supabaseSync';
import { getSupabaseClient } from '../../../lib/supabase';

export const PAYSLIPS_KEY = 'smart_vidros_payslips';
export const PAYSLIPS_COUNTER_KEY = 'smart_vidros_payslips_counter';

export const INITIAL_PAYSLIPS: Payslip[] = [
  {
    id: 'payslip-sample-1',
    companyId: getCurrentCompanyId(),
    userId: getCurrentUserId(),
    code: 'HOL-2026-000001',
    employeeName: 'Carlos Eduardo da Silva',
    employeeRole: 'Vidraceiro & Instalador de Obras',
    employeeCpf: '123.456.789-00',
    employeePix: 'carlos.instalador@gmail.com',
    referenceMonth: 'Setembro / 2026',
    paymentType: 'salario',
    paymentDate: '2026-09-30',
    baseSalary: 2200.0,
    earnings: [
      {
        id: 'earn-1',
        description: 'Horas Extras / Instalação em Altura',
        amount: 350.0,
      },
      {
        id: 'earn-2',
        description: 'Bonificação por Produção de Obras',
        amount: 250.0,
      },
    ],
    deductions: [
      {
        id: 'ded-1',
        description: 'Adiantamento Quinzenal (Vale)',
        amount: 500.0,
      },
    ],
    totalEarnings: 2800.0,
    totalDeductions: 500.0,
    netAmount: 2300.0,
    paymentMethod: 'pix',
    notes: 'Pagamento referente à remuneração mensal e instalações de obras de Setembro/2026.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getNextPayslipCode(): string {
  const currentCounter = storageAdapter.getItem<string>(PAYSLIPS_COUNTER_KEY, null);
  let counter = currentCounter ? parseInt(currentCounter, 10) : 1;
  const code = `HOL-2026-${String(counter).padStart(6, '0')}`;
  storageAdapter.setItem(PAYSLIPS_COUNTER_KEY, String(counter + 1));
  return code;
}

export function getPayslips(): Payslip[] {
  const data = storageAdapter.getItem<Payslip[]>(PAYSLIPS_KEY, null);
  if (data === null || data === undefined) {
    storageAdapter.setItem(PAYSLIPS_KEY, INITIAL_PAYSLIPS);
    if (!storageAdapter.getItem(PAYSLIPS_COUNTER_KEY, null)) {
      storageAdapter.setItem(PAYSLIPS_COUNTER_KEY, '2');
    }
    return INITIAL_PAYSLIPS;
  }
  if (!Array.isArray(data)) {
    storageAdapter.setItem(PAYSLIPS_KEY, INITIAL_PAYSLIPS);
    return INITIAL_PAYSLIPS;
  }
  return data;
}

export function getPayslipById(id: string): Payslip | undefined {
  return getPayslips().find((p) => p.id === id);
}

export function createPayslip(
  payslipData: Omit<Payslip, 'id' | 'code' | 'createdAt' | 'updatedAt'>
): Payslip {
  return savePayslip(payslipData);
}

export function savePayslip(
  payslipData: Omit<Payslip, 'id' | 'code' | 'createdAt' | 'updatedAt'> & {
    id?: string;
    code?: string;
  }
): Payslip {
  const payslips = getPayslips();
  const now = new Date().toISOString();
  const companyId = payslipData.companyId || getCurrentCompanyId();
  const userId = payslipData.userId || getCurrentUserId();

  // Calcular totais
  const earningsList: PayslipItem[] = Array.isArray(payslipData.earnings) ? payslipData.earnings : [];
  const deductionsList: PayslipItem[] = Array.isArray(payslipData.deductions) ? payslipData.deductions : [];
  
  const additionalEarningsTotal = earningsList.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const totalDeductions = deductionsList.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const baseSalary = Number(payslipData.baseSalary) || 0;
  const totalEarnings = baseSalary + additionalEarningsTotal;
  const netAmount = Math.max(0, totalEarnings - totalDeductions);

  if (payslipData.id) {
    const index = payslips.findIndex((p) => p.id === payslipData.id);
    if (index !== -1) {
      const updatedPayslip: Payslip = {
        ...payslips[index],
        ...payslipData,
        id: payslipData.id,
        code: payslipData.code || payslips[index].code,
        companyId,
        userId,
        baseSalary,
        earnings: earningsList,
        deductions: deductionsList,
        totalEarnings,
        totalDeductions,
        netAmount,
        updatedAt: now,
      };

      payslips[index] = updatedPayslip;
      storageAdapter.setItem(PAYSLIPS_KEY, payslips);
      autoSyncEntityChange('payslips', 'upsert', updatedPayslip);
      syncPayslipDirectlyToSupabase(updatedPayslip);
      return updatedPayslip;
    }
  }

  const newPayslip: Payslip = {
    ...payslipData,
    id: generateUUID(),
    companyId,
    userId,
    code: payslipData.code || getNextPayslipCode(),
    baseSalary,
    earnings: earningsList,
    deductions: deductionsList,
    totalEarnings,
    totalDeductions,
    netAmount,
    createdAt: now,
    updatedAt: now,
  };

  payslips.unshift(newPayslip);
  storageAdapter.setItem(PAYSLIPS_KEY, payslips);
  autoSyncEntityChange('payslips', 'upsert', newPayslip);
  syncPayslipDirectlyToSupabase(newPayslip);
  return newPayslip;
}

export function updatePayslip(
  id: string,
  payslipData: Partial<Omit<Payslip, 'id' | 'createdAt' | 'updatedAt'>>
): Payslip | null {
  const existing = getPayslipById(id);
  if (!existing) return null;

  return savePayslip({
    ...existing,
    ...payslipData,
    id,
  });
}

export function deletePayslip(id: string): void {
  const payslips = getPayslips().filter((p) => p.id !== id);
  storageAdapter.setItem(PAYSLIPS_KEY, payslips);
  autoSyncEntityChange('payslips', 'delete', id);

  try {
    const client = getSupabaseClient();
    if (client) {
      client
        .from('payslips')
        .delete()
        .eq('id', id)
        .then(({ error }: any) => {
          if (error) console.warn('[Supabase] Erro ao excluir contracheque na nuvem:', error);
        });
    }
  } catch {}
}

export function clearAllPayslips(): Payslip[] {
  storageAdapter.setItem(PAYSLIPS_KEY, []);
  storageAdapter.setItem(PAYSLIPS_COUNTER_KEY, '1');
  return [];
}

async function syncPayslipDirectlyToSupabase(payslip: Payslip) {
  try {
    const client = getSupabaseClient();
    if (!client) return;

    await client.from('payslips').upsert([
      {
        id: payslip.id,
        company_id: payslip.companyId || 'comp-smart-vidros-001',
        code: payslip.code,
        employee_name: payslip.employeeName,
        employee_role: payslip.employeeRole,
        employee_cpf: payslip.employeeCpf || null,
        employee_pix: payslip.employeePix || null,
        reference_month: payslip.referenceMonth,
        payment_type: payslip.paymentType,
        payment_date: payslip.paymentDate,
        base_salary: payslip.baseSalary,
        earnings: payslip.earnings,
        deductions: payslip.deductions,
        total_earnings: payslip.totalEarnings,
        total_deductions: payslip.totalDeductions,
        net_amount: payslip.netAmount,
        payment_method: payslip.paymentMethod,
        notes: payslip.notes || null,
        created_at: payslip.createdAt,
        updated_at: payslip.updatedAt,
      },
    ]);
  } catch (err) {
    // Falhas em tabelas opcionais remotas não travam o fluxo local
    console.warn('[Supabase] Sincronização direta de contracheque:', err);
  }
}
