import { Quote } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId, getCurrentUserId } from '../auth';

const QUOTES_KEY = 'smart_vidros_quotes';
const COUNTER_KEY = 'smart_vidros_counter';

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'quote-sample-1',
    companyId: getCurrentCompanyId(),
    userId: getCurrentUserId(),
    code: 'ORC-2026-001',
    clientName: 'Amaryel',
    clientPhone: '(89) 99991-0028',
    date: '2026-08-11',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'aprovado',
    items: [
      {
        id: 'item-1',
        type: 'dimensao',
        name: 'Vidro 4mm',
        description: 'Vidro float 4mm lapidado para janelas',
        lengthMm: 1200,
        widthMm: 800,
        areaM2: 0.96,
        quantity: 5,
        pricePerM2: 150,
        totalPrice: 720.00,
      },
      {
        id: 'item-2',
        type: 'simples',
        name: 'Espelho circular',
        description: 'Espelho lapidado diâmetro 60cm',
        quantity: 5,
        unitPrice: 100,
        totalPrice: 500.00,
      },
    ],
    discountType: 'percent',
    discountValue: 5,
    subtotal: 1220.00,
    discountAmount: 61.00,
    total: 1159.00,
    notes: 'Orçamento com entrega e prazo de instalação de 5 dias úteis após confirmação.',
  },
];

export function getNextQuoteCode(): string {
  const currentCounter = storageAdapter.getItem<string>(COUNTER_KEY, null);
  let counter = currentCounter ? parseInt(currentCounter, 10) : 1;
  const year = new Date().getFullYear();
  const code = `ORC-${year}-${String(counter).padStart(3, '0')}`;
  storageAdapter.setItem(COUNTER_KEY, String(counter + 1));
  return code;
}

export function getBudgets(): Quote[] {
  return getQuotes();
}

export function getQuotes(): Quote[] {
  const data = storageAdapter.getItem<Quote[]>(QUOTES_KEY, null);
  if (!data) {
    storageAdapter.setItem(QUOTES_KEY, INITIAL_QUOTES);
    if (!storageAdapter.getItem(COUNTER_KEY, null)) {
      storageAdapter.setItem(COUNTER_KEY, '2');
    }
    return INITIAL_QUOTES;
  }
  return data;
}

export function getBudgetById(id: string): Quote | undefined {
  return getQuoteById(id);
}

export function getQuoteById(id: string): Quote | undefined {
  return getQuotes().find((q) => q.id === id);
}

export function createBudget(
  quoteData: Omit<Quote, 'id' | 'code' | 'createdAt' | 'updatedAt'>
): Quote {
  return saveQuote(quoteData);
}

export function saveQuote(
  quoteData: Omit<Quote, 'id' | 'code' | 'createdAt' | 'updatedAt'> & { id?: string; code?: string }
): Quote {
  const quotes = getQuotes();
  const now = new Date().toISOString();
  const companyId = quoteData.companyId || getCurrentCompanyId();
  const userId = quoteData.userId || getCurrentUserId();

  if (quoteData.id) {
    const index = quotes.findIndex((q) => q.id === quoteData.id);
    if (index !== -1) {
      const updatedQuote: Quote = {
        ...quotes[index],
        ...quoteData,
        id: quoteData.id,
        code: quoteData.code || quotes[index].code,
        companyId,
        userId,
        updatedAt: now,
      };
      quotes[index] = updatedQuote;
      storageAdapter.setItem(QUOTES_KEY, quotes);
      return updatedQuote;
    }
  }

  const newQuote: Quote = {
    ...quoteData,
    id: generateUUID(),
    code: quoteData.code || getNextQuoteCode(),
    companyId,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  quotes.unshift(newQuote);
  storageAdapter.setItem(QUOTES_KEY, quotes);
  return newQuote;
}

export function updateBudget(
  id: string,
  quoteData: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>
): Quote | null {
  const existing = getQuoteById(id);
  if (!existing) return null;
  return saveQuote({
    ...existing,
    ...quoteData,
    id,
  });
}

export function deleteBudget(id: string): void {
  deleteQuote(id);
}

export function deleteQuote(id: string): void {
  const quotes = getQuotes().filter((q) => q.id !== id);
  storageAdapter.setItem(QUOTES_KEY, quotes);
}

export function updateQuoteStatus(id: string, newStatus: Quote['status']): Quote | null {
  const quotes = getQuotes();
  const index = quotes.findIndex((q) => q.id === id);
  if (index !== -1) {
    quotes[index].status = newStatus;
    quotes[index].updatedAt = new Date().toISOString();
    storageAdapter.setItem(QUOTES_KEY, quotes);
    return quotes[index];
  }
  return null;
}
