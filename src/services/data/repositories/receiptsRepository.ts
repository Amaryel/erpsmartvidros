import { Receipt } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId, getCurrentUserId } from '../auth';
import { addServiceToList } from './servicesRepository';
import { autoSyncEntityChange } from '../supabaseSync';

const RECEIPTS_KEY = 'smart_vidros_receipts';
const RECEIPTS_COUNTER_KEY = 'smart_vidros_receipts_counter';

export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'receipt-sample-1',
    companyId: getCurrentCompanyId(),
    userId: getCurrentUserId(),
    code: 'Recibo Nº 000001',
    clientName: 'Amaryel',
    clientPhone: '(89) 99991-0028',
    amount: 6900.00,
    service: 'Instalação de box de banheiro e Espelhos',
    downPaymentType: 'percent',
    downPaymentValue: 30,
    downPaymentAmount: 2070.00,
    date: '2026-08-11',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Entrada referente ao pedido de vidros temperados.',
  },
];

export function getNextReceiptCode(): string {
  const currentCounter = storageAdapter.getItem<string>(RECEIPTS_COUNTER_KEY, null);
  let counter = currentCounter ? parseInt(currentCounter, 10) : 1;
  const code = `Recibo Nº ${String(counter).padStart(6, '0')}`;
  storageAdapter.setItem(RECEIPTS_COUNTER_KEY, String(counter + 1));
  return code;
}

export function getReceipts(): Receipt[] {
  const data = storageAdapter.getItem<Receipt[]>(RECEIPTS_KEY, null);
  if (!data) {
    storageAdapter.setItem(RECEIPTS_KEY, INITIAL_RECEIPTS);
    if (!storageAdapter.getItem(RECEIPTS_COUNTER_KEY, null)) {
      storageAdapter.setItem(RECEIPTS_COUNTER_KEY, '2');
    }
    return INITIAL_RECEIPTS;
  }
  return data;
}

export function getReceiptById(id: string): Receipt | undefined {
  return getReceipts().find((r) => r.id === id);
}

export function createReceipt(
  receiptData: Omit<Receipt, 'id' | 'code' | 'createdAt' | 'updatedAt'>
): Receipt {
  return saveReceipt(receiptData);
}

export function saveReceipt(
  receiptData: Omit<Receipt, 'id' | 'code' | 'createdAt' | 'updatedAt'> & { id?: string; code?: string }
): Receipt {
  const receipts = getReceipts();
  const now = new Date().toISOString();
  const companyId = receiptData.companyId || getCurrentCompanyId();
  const userId = receiptData.userId || getCurrentUserId();

  if (receiptData.service) {
    addServiceToList(receiptData.service);
  }

  if (receiptData.id) {
    const index = receipts.findIndex((r) => r.id === receiptData.id);
    if (index !== -1) {
      const updatedReceipt: Receipt = {
        ...receipts[index],
        ...receiptData,
        id: receiptData.id,
        code: receiptData.code || receipts[index].code,
        companyId,
        userId,
        updatedAt: now,
      };
      receipts[index] = updatedReceipt;
      storageAdapter.setItem(RECEIPTS_KEY, receipts);
      autoSyncEntityChange('receipts', 'upsert', updatedReceipt);
      return updatedReceipt;
    }
  }

  const newReceipt: Receipt = {
    ...receiptData,
    id: generateUUID(),
    code: receiptData.code || getNextReceiptCode(),
    companyId,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  receipts.unshift(newReceipt);
  storageAdapter.setItem(RECEIPTS_KEY, receipts);
  autoSyncEntityChange('receipts', 'upsert', newReceipt);
  return newReceipt;
}

export function updateReceipt(
  id: string,
  receiptData: Partial<Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>>
): Receipt | null {
  const existing = getReceiptById(id);
  if (!existing) return null;
  return saveReceipt({
    ...existing,
    ...receiptData,
    id,
  });
}

export function deleteReceipt(id: string): void {
  const receipts = getReceipts().filter((r) => r.id !== id);
  storageAdapter.setItem(RECEIPTS_KEY, receipts);
  autoSyncEntityChange('receipts', 'delete', id);
}
