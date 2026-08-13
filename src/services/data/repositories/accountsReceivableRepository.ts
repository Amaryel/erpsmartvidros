import { Receivable, Receipt, PaymentMethod } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId, getCurrentUserId } from '../auth';
import { saveReceipt } from './receiptsRepository';

const RECEIVABLES_KEY = 'smart_vidros_receivables';
const RECEIVABLES_COUNTER_KEY = 'smart_vidros_receivables_counter';

export function getNextReceivableCode(): string {
  const currentCounter = storageAdapter.getItem<string>(RECEIVABLES_COUNTER_KEY, null);
  let counter = currentCounter ? parseInt(currentCounter, 10) : 1;
  const code = `CR-${String(counter).padStart(6, '0')}`;
  storageAdapter.setItem(RECEIVABLES_COUNTER_KEY, String(counter + 1));
  return code;
}

export function getAccountsReceivable(): Receivable[] {
  return getReceivables();
}

export function getReceivables(): Receivable[] {
  const data = storageAdapter.getItem<Receivable[]>(RECEIVABLES_KEY, null);
  return data ? data : [];
}

export function getAccountReceivableById(id: string): Receivable | undefined {
  return getReceivables().find((r) => r.id === id);
}

export function saveAccountReceivable(receivable: Receivable): Receivable {
  return saveReceivable(receivable);
}

export function saveReceivable(receivable: Receivable): Receivable {
  const list = getReceivables();
  const idx = list.findIndex((r) => r.id === receivable.id);
  const now = new Date().toISOString();
  const companyId = receivable.companyId || getCurrentCompanyId();
  const userId = receivable.userId || getCurrentUserId();

  const preparedReceivable: Receivable = {
    ...receivable,
    companyId,
    userId,
  };

  if (idx !== -1) {
    list[idx] = { ...preparedReceivable, updatedAt: now };
  } else {
    list.unshift({ ...preparedReceivable, createdAt: preparedReceivable.createdAt || now, updatedAt: now });
  }

  storageAdapter.setItem(RECEIVABLES_KEY, list);
  return preparedReceivable;
}

export function updateAccountReceivable(
  id: string,
  updates: Partial<Omit<Receivable, 'id' | 'createdAt' | 'updatedAt'>>
): Receivable | null {
  const existing = getAccountReceivableById(id);
  if (!existing) return null;

  return saveReceivable({
    ...existing,
    ...updates,
    id,
  });
}

export function deleteAccountReceivable(id: string): void {
  deleteReceivable(id);
}

export function deleteReceivable(id: string): void {
  const list = getReceivables().filter((r) => r.id !== id);
  storageAdapter.setItem(RECEIVABLES_KEY, list);
}

export function updateInstallmentDueDate(
  receivableId: string,
  installmentId: string,
  newDueDate: string
): Receivable | null {
  const list = getReceivables();
  const idx = list.findIndex((r) => r.id === receivableId);
  if (idx === -1) return null;

  const rec = list[idx];
  const instIdx = rec.installments.findIndex((i) => i.id === installmentId);
  if (instIdx === -1) return null;

  rec.installments[instIdx].dueDate = newDueDate;
  rec.updatedAt = new Date().toISOString();
  list[idx] = rec;
  storageAdapter.setItem(RECEIVABLES_KEY, list);
  return rec;
}

export function payReceivableInstallment(
  receivableId: string,
  installmentId: string,
  paidAmountOrPayments: number | { method: PaymentMethod; amount: number; notes?: string }[],
  method?: PaymentMethod,
  notes?: string
): { receivable: Receivable; receipt?: Receipt } | null {
  const list = getReceivables();
  const idx = list.findIndex((r) => r.id === receivableId);
  if (idx === -1) return null;

  const rec = list[idx];
  const instIdx = rec.installments.findIndex((i) => i.id === installmentId);
  if (instIdx === -1) return null;

  const inst = rec.installments[instIdx];
  const today = new Date().toISOString().split('T')[0];

  let paymentsList: { method: PaymentMethod; amount: number; notes?: string }[] = [];
  if (Array.isArray(paidAmountOrPayments)) {
    paymentsList = paidAmountOrPayments;
  } else {
    paymentsList = [{ method: method || 'pix', amount: paidAmountOrPayments, notes }];
  }

  const totalPaidInThisBaixa = paymentsList.reduce((sum, p) => sum + (p.amount || 0), 0);
  if (totalPaidInThisBaixa <= 0) return null;

  const newPaidAmount = (inst.paidAmount || 0) + totalPaidInThisBaixa;
  const isFullyPaid = newPaidAmount >= inst.amount;

  inst.paidAmount = Math.min(inst.amount, newPaidAmount);
  inst.status = isFullyPaid ? 'pago' : 'parcial';
  inst.paidAt = today;
  if (!inst.history) inst.history = [];

  paymentsList.forEach((p, i) => {
    inst.history!.push({
      id: 'pay-hist-' + generateUUID(),
      date: today,
      amount: p.amount,
      method: p.method,
      notes: p.notes,
    });
  });

  rec.installments[instIdx] = inst;

  // Recalcular totais da conta a receber
  const totalPaid = rec.installments.reduce((acc, item) => acc + (item.paidAmount || 0), 0);
  rec.paidAmount = totalPaid;
  rec.remainingAmount = Math.max(0, rec.totalAmount - totalPaid);
  if (rec.remainingAmount <= 0) {
    rec.status = 'pago';
  } else if (totalPaid > 0) {
    rec.status = 'parcial';
  } else {
    rec.status = 'pendente';
  }
  rec.updatedAt = new Date().toISOString();

  list[idx] = rec;
  storageAdapter.setItem(RECEIVABLES_KEY, list);

  const methodLabels: Record<PaymentMethod, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão Crédito',
    cartao_debito: 'Cartão Débito',
    transferencia: 'Transferência',
    fiado: 'Fiado',
  };

  const paymentMethodsSummary = paymentsList
    .map((p) => `${methodLabels[p.method] || p.method}: R$ ${p.amount.toFixed(2)}`)
    .join(' | ');

  // Gerar recibo da baixa
  const receipt = saveReceipt({
    companyId: rec.companyId,
    userId: rec.userId,
    clientName: rec.clientName,
    clientPhone: rec.clientPhone,
    amount: totalPaidInThisBaixa,
    service: `Baixa da Parcela ${inst.number} da Venda ${rec.saleCode}`,
    date: today,
    quoteId: rec.quoteId,
    quoteCode: rec.quoteCode,
    saleId: rec.saleId,
    saleCode: rec.saleCode,
    receivableId: rec.id,
    saleTotalAmount: rec.totalAmount,
    salePaidAmount: totalPaid,
    saleFiadoAmount: rec.remainingAmount,
    paymentMethodsSummary,
    notes: `Baixa realizada no parcelamento. Formas: ${paymentMethodsSummary}`,
  });

  return { receivable: rec, receipt };
}
