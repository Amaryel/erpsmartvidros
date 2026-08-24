import {
  CashTransaction,
  CashInitialBalance,
  CashSession,
  CashCategoryItem,
  CashPaymentMethod,
  CashTransactionType,
  PaymentMethod,
} from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId, getCurrentUserId, getCurrentSessionUser } from '../auth';
import { autoSyncEntityChange } from '../supabaseSync';

const CASH_TRANSACTIONS_KEY = 'smart_vidros_cash_transactions';
const CASH_INITIAL_BALANCE_KEY = 'smart_vidros_cash_initial_balance';
const CASH_SESSIONS_KEY = 'smart_vidros_cash_sessions';
const CASH_CATEGORIES_KEY = 'smart_vidros_cash_categories';

// ============================================================
// CATEGORIAS PADRÃO DE ENTRADA E SAÍDA (DIA A DIA COMPLETO)
// ============================================================
export const DEFAULT_CASH_CATEGORIES: CashCategoryItem[] = [
  // Despesas / Saídas - Dia a Dia & Operação
  { id: 'cat-desp-1', name: 'Combustível / Abastecimento', type: 'saida', isDefault: true },
  { id: 'cat-desp-2', name: 'Alimentação / Almoço / Lanches', type: 'saida', isDefault: true },
  { id: 'cat-desp-3', name: 'Compras de Vidros & Espelhos', type: 'saida', isDefault: true },
  { id: 'cat-desp-4', name: 'Compras de Alumínio & Perfis', type: 'saida', isDefault: true },
  { id: 'cat-desp-5', name: 'Compras de Ferragens & Kits de Box', type: 'saida', isDefault: true },
  { id: 'cat-desp-6', name: 'Compras de Silicone, PU & Fixação', type: 'saida', isDefault: true },
  { id: 'cat-desp-7', name: 'Compras Gerais / Supermercado / Limpeza', type: 'saida', isDefault: true },
  { id: 'cat-desp-8', name: 'Fornecedor / Faturas de Materiais', type: 'saida', isDefault: true },
  { id: 'cat-desp-9', name: 'Ferramentas, Máquinas & Insumos', type: 'saida', isDefault: true },
  { id: 'cat-desp-10', name: 'EPIs & Segurança no Trabalho', type: 'saida', isDefault: true },
  { id: 'cat-desp-11', name: 'Diárias de Ajudantes / Montadores', type: 'saida', isDefault: true },
  { id: 'cat-desp-12', name: 'Frete, Carretos & Transportes', type: 'saida', isDefault: true },
  { id: 'cat-desp-13', name: 'Manutenção de Veículos / Oficina / Pneus', type: 'saida', isDefault: true },
  { id: 'cat-desp-14', name: 'Manutenção de Ferramentas & Oficina', type: 'saida', isDefault: true },
  { id: 'cat-desp-15', name: 'Aluguel do Ponto / Galpão', type: 'saida', isDefault: true },
  { id: 'cat-desp-16', name: 'Energia Elétrica', type: 'saida', isDefault: true },
  { id: 'cat-desp-17', name: 'Água & Esgoto', type: 'saida', isDefault: true },
  { id: 'cat-desp-18', name: 'Telefone, Internet & Software', type: 'saida', isDefault: true },
  { id: 'cat-desp-19', name: 'Contabilidade & Honorários', type: 'saida', isDefault: true },
  { id: 'cat-desp-20', name: 'Impostos, Tributos & DAS Simples', type: 'saida', isDefault: true },
  { id: 'cat-desp-21', name: 'Tarifas Bancárias & Taxas de Maquininha', type: 'saida', isDefault: true },
  { id: 'cat-desp-22', name: 'Salários & Adiantamentos da Equipe', type: 'saida', isDefault: true },
  { id: 'cat-desp-23', name: 'Pró-Labore / Retirada dos Sócios', type: 'saida', isDefault: true },
  { id: 'cat-desp-24', name: 'Marketing, Propaganda & Panfletos', type: 'saida', isDefault: true },
  { id: 'cat-desp-25', name: 'Pedágio & Estacionamento', type: 'saida', isDefault: true },
  { id: 'cat-desp-26', name: 'Outras Despesas / Diversos', type: 'saida', isDefault: true },

  // Entradas / Recebimentos
  { id: 'cat-ent-1', name: 'Venda de Box & Esquadrias', type: 'entrada', isDefault: true },
  { id: 'cat-ent-2', name: 'Venda de Vidros & Espelhos', type: 'entrada', isDefault: true },
  { id: 'cat-ent-3', name: 'Venda / PDV Balcão', type: 'entrada', isDefault: true },
  { id: 'cat-ent-4', name: 'Serviço de Instalação & Montagem', type: 'entrada', isDefault: true },
  { id: 'cat-ent-5', name: 'Serviço de Manutenção & Reparos', type: 'entrada', isDefault: true },
  { id: 'cat-ent-6', name: 'Recebimento de Fiado (Contas a Receber)', type: 'entrada', isDefault: true },
  { id: 'cat-ent-7', name: 'Recebimento de Parcela', type: 'entrada', isDefault: true },
  { id: 'cat-ent-8', name: 'Entrada / Sinal de Orçamento', type: 'entrada', isDefault: true },
  { id: 'cat-ent-9', name: 'Aporte de Capital / Investimento', type: 'entrada', isDefault: true },
  { id: 'cat-ent-10', name: 'Rendimentos / Outros Recebimentos', type: 'entrada', isDefault: true },
];

export function getCashCategories(): CashCategoryItem[] {
  const data = storageAdapter.getItem<CashCategoryItem[]>(CASH_CATEGORIES_KEY, null);
  if (!data || data.length === 0) {
    storageAdapter.setItem(CASH_CATEGORIES_KEY, DEFAULT_CASH_CATEGORIES);
    return DEFAULT_CASH_CATEGORIES;
  }

  // Mesclar para garantir que novas categorias padrão apareçam sem sobrescrever as do usuário
  let hasNew = false;
  const merged = [...data];
  DEFAULT_CASH_CATEGORIES.forEach((defaultCat) => {
    const exists = merged.some(
      (c) => c.id === defaultCat.id || c.name.toLowerCase() === defaultCat.name.toLowerCase()
    );
    if (!exists) {
      merged.push(defaultCat);
      hasNew = true;
    }
  });

  if (hasNew) {
    storageAdapter.setItem(CASH_CATEGORIES_KEY, merged);
  }

  return merged;
}

export function saveCashCategory(category: CashCategoryItem): CashCategoryItem {
  const list = getCashCategories();
  const idx = list.findIndex((c) => c.id === category.id);
  const prepared = {
    ...category,
    id: category.id || `cat-${generateUUID()}`,
  };

  if (idx !== -1) {
    list[idx] = prepared;
  } else {
    list.push(prepared);
  }

  storageAdapter.setItem(CASH_CATEGORIES_KEY, list);
  return prepared;
}

export function deleteCashCategory(id: string): boolean {
  const list = getCashCategories();
  const item = list.find((c) => c.id === id);
  if (item?.isDefault) {
    return false; // Não permitir excluir categorias do sistema
  }
  const filtered = list.filter((c) => c.id !== id);
  storageAdapter.setItem(CASH_CATEGORIES_KEY, filtered);
  return true;
}

// ============================================================
// SALDO INICIAL DO CAIXA
// ============================================================
export function getCashInitialBalance(): CashInitialBalance {
  const companyId = getCurrentCompanyId();
  const data = storageAdapter.getItem<CashInitialBalance>(CASH_INITIAL_BALANCE_KEY, null);
  if (data) return data;

  const defaultBalance: CashInitialBalance = {
    id: 'init-balance-001',
    companyId,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: 'Saldo inicial padrão do sistema',
    setBy: 'Sistema',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [],
  };

  storageAdapter.setItem(CASH_INITIAL_BALANCE_KEY, defaultBalance);
  return defaultBalance;
}

export function setCashInitialBalance(
  amount: number,
  date: string,
  notes?: string,
  setBy?: string
): CashInitialBalance {
  const companyId = getCurrentCompanyId();
  const current = getCashInitialBalance();
  const now = new Date().toISOString();
  const user = getCurrentSessionUser();
  const author = setBy || user?.name || 'Administrador';

  const historyEntry = {
    date: current.date,
    amount: current.amount,
    setBy: current.setBy,
    notes: current.notes,
    timestamp: current.updatedAt || current.createdAt || now,
  };

  const updated: CashInitialBalance = {
    ...current,
    companyId,
    amount: Number(amount) || 0,
    date: date || new Date().toISOString().split('T')[0],
    notes: notes || '',
    setBy: author,
    updatedAt: now,
    history: [historyEntry, ...(current.history || [])],
  };

  storageAdapter.setItem(CASH_INITIAL_BALANCE_KEY, updated);
  autoSyncEntityChange('cash_initial_balance' as any, 'upsert', updated);
  return updated;
}

// ============================================================
// MOVIMENTAÇÕES DE CAIXA (ENTRADAS E SAÍDAS)
// ============================================================
export function getCashTransactions(): CashTransaction[] {
  const data = storageAdapter.getItem<CashTransaction[]>(CASH_TRANSACTIONS_KEY, null);
  return data ? data : [];
}

export function getCashTransactionById(id: string): CashTransaction | undefined {
  return getCashTransactions().find((t) => t.id === id);
}

export function createCashTransaction(
  data: Omit<CashTransaction, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): CashTransaction {
  const transactions = getCashTransactions();
  const now = new Date().toISOString();
  const companyId = data.companyId || getCurrentCompanyId();
  const userId = data.userId || getCurrentUserId();
  const user = getCurrentSessionUser();
  const userName = data.userName || user?.name || 'Usuário';

  const newTx: CashTransaction = {
    ...data,
    id: generateUUID(),
    companyId,
    userId,
    userName,
    status: 'ativo',
    createdAt: now,
    updatedAt: now,
    date: data.date || now.split('T')[0],
    time: data.time || now.split('T')[1]?.slice(0, 5) || '12:00',
  };

  transactions.unshift(newTx);
  storageAdapter.setItem(CASH_TRANSACTIONS_KEY, transactions);
  autoSyncEntityChange('cash_transactions' as any, 'upsert', newTx);
  return newTx;
}

export function updateCashTransaction(
  id: string,
  updates: Partial<CashTransaction>,
  reason: string,
  editedBy?: string
): CashTransaction | null {
  const transactions = getCashTransactions();
  const idx = transactions.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const user = getCurrentSessionUser();
  const author = editedBy || user?.name || 'Administrador';

  const updated: CashTransaction = {
    ...transactions[idx],
    ...updates,
    editedAt: now,
    editedBy: author,
    editReason: reason || 'Edição manual autorizada',
    updatedAt: now,
  };

  transactions[idx] = updated;
  storageAdapter.setItem(CASH_TRANSACTIONS_KEY, transactions);
  autoSyncEntityChange('cash_transactions' as any, 'upsert', updated);
  return updated;
}

export function cancelCashTransaction(
  id: string,
  reason: string,
  cancelledBy?: string
): CashTransaction | null {
  const transactions = getCashTransactions();
  const idx = transactions.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const user = getCurrentSessionUser();
  const author = cancelledBy || user?.name || 'Administrador';

  const cancelled: CashTransaction = {
    ...transactions[idx],
    status: 'cancelado',
    cancelledAt: now,
    cancelledBy: author,
    cancellationReason: reason || 'Cancelamento solicitado pelo gestor',
    updatedAt: now,
  };

  transactions[idx] = cancelled;
  storageAdapter.setItem(CASH_TRANSACTIONS_KEY, transactions);
  autoSyncEntityChange('cash_transactions' as any, 'upsert', cancelled);
  return cancelled;
}

// ============================================================
// INTEGRAÇÃO AUTOMÁTICA COM VENDAS E RECEBIMENTOS
// ============================================================

/**
 * Converte forma de pagamento geral para forma de pagamento do caixa
 */
export function mapPaymentMethodToCash(method: PaymentMethod | string): CashPaymentMethod {
  switch (method) {
    case 'dinheiro':
      return 'dinheiro';
    case 'pix':
      return 'pix';
    case 'cartao_credito':
      return 'cartao_credito';
    case 'cartao_debito':
      return 'cartao_debito';
    case 'transferencia':
      return 'transferencia';
    case 'cheque':
      return 'cheque';
    default:
      return 'outro';
  }
}

/**
 * Registra entradas de caixa oriundas de uma venda à vista / com entrada
 */
export function recordSaleCashPayments(
  saleId: string,
  saleCode: string,
  clientName: string,
  date: string,
  payments: Array<{ method: PaymentMethod; amount: number; notes?: string }>
): void {
  const existing = getCashTransactions();

  payments.forEach((p) => {
    // Não lança Fiado no caixa (apenas formas com recebimento real)
    if (p.method === 'fiado' || p.amount <= 0) return;

    // Evita duplicar se já foi lançado
    const alreadyExists = existing.some(
      (t) =>
        t.saleId === saleId &&
        t.paymentMethod === mapPaymentMethodToCash(p.method) &&
        Math.abs(t.amount - p.amount) < 0.01 &&
        t.status === 'ativo'
    );

    if (!alreadyExists) {
      createCashTransaction({
        type: 'entrada',
        amount: p.amount,
        categoryId: 'cat-ent-1',
        categoryName: 'Venda',
        description: `Venda ${saleCode} — ${clientName || 'Cliente'}`,
        date: date || new Date().toISOString().split('T')[0],
        paymentMethod: mapPaymentMethodToCash(p.method),
        saleId,
        saleCode,
        clientName,
        notes: p.notes || `Recebimento referente à venda ${saleCode}`,
        companyId: getCurrentCompanyId(),
        userId: getCurrentUserId(),
      });
    }
  });
}

/**
 * Registra entrada de caixa quando uma parcela do Contas a Receber (Fiado) é paga
 */
export function recordReceivableCashPayment(
  receivableId: string,
  saleCode: string,
  clientName: string,
  installmentNumber: number,
  method: PaymentMethod,
  amount: number,
  date: string,
  notes?: string
): void {
  if (amount <= 0 || method === 'fiado') return;

  createCashTransaction({
    type: 'entrada',
    amount,
    categoryId: 'cat-ent-2',
    categoryName: 'Recebimento de fiado',
    description: `Recebimento Parcela ${installmentNumber} — ${clientName} (Venda ${saleCode})`,
    date: date || new Date().toISOString().split('T')[0],
    paymentMethod: mapPaymentMethodToCash(method),
    receivableId,
    saleCode,
    clientName,
    notes: notes || `Baixa de parcela fiado do cliente ${clientName}`,
    companyId: getCurrentCompanyId(),
    userId: getCurrentUserId(),
  });
}

// ============================================================
// SESSÕES DE ABERTURA E FECHAMENTO DE CAIXA (OPCIONAL)
// ============================================================
export function getCashSessions(): CashSession[] {
  const data = storageAdapter.getItem<CashSession[]>(CASH_SESSIONS_KEY, null);
  return data ? data : [];
}

export function getCurrentOpenCashSession(): CashSession | null {
  const sessions = getCashSessions();
  const openSession = sessions.find((s) => s.status === 'aberto');
  return openSession || null;
}

export function openCashSession(
  initialBalance: number,
  date?: string,
  notes?: string,
  openedBy?: string
): CashSession {
  const sessions = getCashSessions();
  const openSession = sessions.find((s) => s.status === 'aberto');
  if (openSession) {
    return openSession; // Já existe um caixa aberto
  }

  const now = new Date().toISOString();
  const user = getCurrentSessionUser();
  const companyId = getCurrentCompanyId();
  const author = openedBy || user?.name || 'Administrador';

  const newSession: CashSession = {
    id: generateUUID(),
    companyId,
    date: date || now.split('T')[0],
    openedAt: now,
    openedBy: author,
    openedByUserId: user?.id,
    initialBalance: Number(initialBalance) || 0,
    notes: notes || '',
    status: 'aberto',
    createdAt: now,
    updatedAt: now,
  };

  sessions.unshift(newSession);
  storageAdapter.setItem(CASH_SESSIONS_KEY, sessions);
  autoSyncEntityChange('cash_sessions' as any, 'upsert', newSession);
  return newSession;
}

export function closeCashSession(
  sessionId: string,
  countedBalance: number,
  differenceNotes?: string,
  closedBy?: string
): CashSession | null {
  const sessions = getCashSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return null;

  const session = sessions[idx];
  const now = new Date().toISOString();
  const user = getCurrentSessionUser();
  const author = closedBy || user?.name || 'Administrador';

  // Calcular movimentações ocorridas durante a sessão
  const txs = getCashTransactions().filter(
    (t) =>
      t.status === 'ativo' &&
      (t.cashSessionId === sessionId ||
        (new Date(t.createdAt).getTime() >= new Date(session.openedAt).getTime() &&
          new Date(t.createdAt).getTime() <= new Date(now).getTime()))
  );

  const totalEntries = txs.filter((t) => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
  const totalExits = txs.filter((t) => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0);
  const expectedBalance = session.initialBalance + totalEntries - totalExits;
  const diff = Math.round((countedBalance - expectedBalance) * 100) / 100;

  let differenceType: 'sobra' | 'falta' | 'exato' = 'exato';
  if (diff > 0.01) differenceType = 'sobra';
  else if (diff < -0.01) differenceType = 'falta';

  const byPaymentMethod: Record<string, number> = {
    dinheiro: 0,
    pix: 0,
    cartao_credito: 0,
    cartao_debito: 0,
    transferencia: 0,
    cheque: 0,
    outro: 0,
  };

  txs.forEach((t) => {
    const m = t.paymentMethod || 'outro';
    if (!byPaymentMethod[m]) byPaymentMethod[m] = 0;
    if (t.type === 'entrada') byPaymentMethod[m] += t.amount;
    else byPaymentMethod[m] -= t.amount;
  });

  const closedSession: CashSession = {
    ...session,
    closedAt: now,
    closedBy: author,
    closedByUserId: user?.id,
    expectedBalance,
    countedBalance,
    difference: diff,
    differenceType,
    differenceNotes: differenceNotes || '',
    status: 'fechado',
    totalEntries,
    totalExits,
    byPaymentMethod,
    updatedAt: now,
  };

  sessions[idx] = closedSession;
  storageAdapter.setItem(CASH_SESSIONS_KEY, sessions);
  autoSyncEntityChange('cash_sessions' as any, 'upsert', closedSession);
  return closedSession;
}

// ============================================================
// CÁLCULO GERAL E DINÂMICO DO SALDO (FONTE DE VERDADE)
// ============================================================
export interface CashSummary {
  initialBalance: number;
  initialBalanceDate: string;
  totalEntries: number;
  totalExits: number;
  currentBalance: number;
  todayEntries: number;
  todayExits: number;
  todayResult: number;
  todayCountEntries: number;
  todayCountExits: number;
  activeSession: CashSession | null;
  byPaymentMethodToday: {
    dinheiro: number;
    pix: number;
    cartao: number;
    outros: number;
  };
  byPaymentMethodAll: Record<CashPaymentMethod, { entradas: number; saidas: number; saldo: number }>;
}

export function calculateCashSummary(filterDate?: string): CashSummary {
  const initial = getCashInitialBalance();
  const transactions = getCashTransactions().filter((t) => t.status === 'ativo');
  const targetDate = filterDate || new Date().toISOString().split('T')[0];

  let totalEntries = 0;
  let totalExits = 0;
  let todayEntries = 0;
  let todayExits = 0;
  let todayCountEntries = 0;
  let todayCountExits = 0;

  const byPaymentMethodToday = {
    dinheiro: 0,
    pix: 0,
    cartao: 0,
    outros: 0,
  };

  const methods: CashPaymentMethod[] = [
    'dinheiro',
    'pix',
    'cartao_credito',
    'cartao_debito',
    'transferencia',
    'cheque',
    'outro',
  ];

  const byPaymentMethodAll: Record<
    CashPaymentMethod,
    { entradas: number; saidas: number; saldo: number }
  > = {
    dinheiro: { entradas: 0, saidas: 0, saldo: 0 },
    pix: { entradas: 0, saidas: 0, saldo: 0 },
    cartao_credito: { entradas: 0, saidas: 0, saldo: 0 },
    cartao_debito: { entradas: 0, saidas: 0, saldo: 0 },
    transferencia: { entradas: 0, saidas: 0, saldo: 0 },
    cheque: { entradas: 0, saidas: 0, saldo: 0 },
    outro: { entradas: 0, saidas: 0, saldo: 0 },
  };

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    const isToday = tx.date === targetDate;
    const method = tx.paymentMethod || 'outro';

    if (tx.type === 'entrada') {
      totalEntries += amount;
      if (byPaymentMethodAll[method]) {
        byPaymentMethodAll[method].entradas += amount;
        byPaymentMethodAll[method].saldo += amount;
      }
      if (isToday) {
        todayEntries += amount;
        todayCountEntries += 1;
        if (method === 'dinheiro') byPaymentMethodToday.dinheiro += amount;
        else if (method === 'pix') byPaymentMethodToday.pix += amount;
        else if (method === 'cartao_credito' || method === 'cartao_debito')
          byPaymentMethodToday.cartao += amount;
        else byPaymentMethodToday.outros += amount;
      }
    } else {
      totalExits += amount;
      if (byPaymentMethodAll[method]) {
        byPaymentMethodAll[method].saidas += amount;
        byPaymentMethodAll[method].saldo -= amount;
      }
      if (isToday) {
        todayExits += amount;
        todayCountExits += 1;
        if (method === 'dinheiro') byPaymentMethodToday.dinheiro -= amount;
        else if (method === 'pix') byPaymentMethodToday.pix -= amount;
        else if (method === 'cartao_credito' || method === 'cartao_debito')
          byPaymentMethodToday.cartao -= amount;
        else byPaymentMethodToday.outros -= amount;
      }
    }
  });

  const currentBalance = initial.amount + totalEntries - totalExits;
  const todayResult = todayEntries - todayExits;
  const activeSession = getCurrentOpenCashSession();

  return {
    initialBalance: initial.amount,
    initialBalanceDate: initial.date,
    totalEntries,
    totalExits,
    currentBalance,
    todayEntries,
    todayExits,
    todayResult,
    todayCountEntries,
    todayCountExits,
    activeSession,
    byPaymentMethodToday,
    byPaymentMethodAll,
  };
}
