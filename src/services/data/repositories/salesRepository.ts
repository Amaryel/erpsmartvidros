import { Sale, Quote, Receivable, Receipt, SalePayment, Installment, PaymentMethod, WorkLogEntry } from '../../../types';
import { storageAdapter } from '../storageAdapter';
import { generateUUID } from '../uuid';
import { getCurrentCompanyId, getCurrentUserId } from '../auth';
import { getQuotes, saveQuote } from './budgetsRepository';
import { saveReceivable, deleteReceivable } from './accountsReceivableRepository';
import { saveReceipt, deleteReceipt } from './receiptsRepository';
import { recordSaleCashPayments } from './cashRepository';
import { autoSyncEntityChange } from '../supabaseSync';

const SALES_KEY = 'smart_vidros_sales';
const SALES_COUNTER_KEY = 'smart_vidros_sales_counter';

export function getNextSaleCode(): string {
  const currentCounter = storageAdapter.getItem<string>(SALES_COUNTER_KEY, null);
  let counter = currentCounter ? parseInt(currentCounter, 10) : 1;
  const year = new Date().getFullYear();
  const code = `VEN-${year}-${String(counter).padStart(3, '0')}`;
  storageAdapter.setItem(SALES_COUNTER_KEY, String(counter + 1));
  return code;
}

export function getSales(): Sale[] {
  const data = storageAdapter.getItem<Sale[]>(SALES_KEY, null);
  return data ? data : [];
}

export function getSaleById(id: string): Sale | undefined {
  return getSales().find((s) => s.id === id);
}

export function createSale(saleData: Omit<Sale, 'id' | 'code' | 'createdAt' | 'updatedAt'> & { id?: string; code?: string }): Sale {
  const now = new Date().toISOString();
  const companyId = saleData.companyId || getCurrentCompanyId();
  const userId = saleData.userId || getCurrentUserId();

  const newSale: Sale = {
    ...saleData,
    id: saleData.id || generateUUID(),
    code: saleData.code || getNextSaleCode(),
    companyId,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const sales = getSales();
  sales.unshift(newSale);
  storageAdapter.setItem(SALES_KEY, sales);
  return newSale;
}

export function updateSale(id: string, updates: Partial<Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>>): Sale | null {
  const sales = getSales();
  const idx = sales.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  const updated: Sale = {
    ...sales[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  sales[idx] = updated;
  storageAdapter.setItem(SALES_KEY, sales);
  autoSyncEntityChange('sales', 'upsert', updated);
  return updated;
}

export function createSaleFromQuote(quote: Quote): Sale {
  return createSaleFromBudget(quote);
}

export function createSaleFromBudget(quote: Quote): Sale {
  const now = new Date().toISOString();
  const companyId = quote.companyId || getCurrentCompanyId();
  const userId = quote.userId || getCurrentUserId();
  
  // Tratar entrada do orçamento se houver
  const hasDownPayment = Boolean(quote.downPaymentAmount && quote.downPaymentAmount > 0);
  const downAmt = hasDownPayment ? Math.min(quote.total, quote.downPaymentAmount || 0) : 0;
  const remAmt = Math.max(0, quote.total - downAmt);

  const initialPayments: SalePayment[] = [];

  if (hasDownPayment && downAmt > 0) {
    initialPayments.push({
      id: 'pay-down-' + generateUUID(),
      method: quote.downPaymentMethod || 'pix',
      amount: downAmt,
      notes: 'Entrada registrada no Orçamento',
    });

    if (remAmt > 0) {
      initialPayments.push({
        id: 'pay-rest-' + generateUUID(),
        method: 'pix',
        amount: remAmt,
        notes: 'Saldo restante a quitar',
      });
    }
  } else {
    initialPayments.push({
      id: 'pay-1-' + generateUUID(),
      method: 'pix',
      amount: quote.total,
      notes: 'Pagamento total',
    });
  }

  const totalPaid = initialPayments
    .filter((p) => p.method !== 'fiado')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalFiado = initialPayments
    .filter((p) => p.method === 'fiado')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Copia itens, cliente, descontos e detalhes do orçamento de origem
  const sale: Sale = {
    id: generateUUID(),
    code: getNextSaleCode(),
    companyId,
    userId,
    clientId: quote.clientId,
    quoteId: quote.id,
    quoteCode: quote.code,
    clientName: quote.clientName || 'Cliente',
    clientPhone: quote.clientPhone || '',
    date: new Date().toISOString().split('T')[0],
    createdAt: now,
    updatedAt: now,
    items: JSON.parse(JSON.stringify(quote.items || [])),
    subtotal: quote.subtotal,
    discountType: quote.discountType || 'fixed',
    discountValue: quote.discountValue || 0,
    discountAmount: quote.discountAmount || 0,
    total: quote.total,
    payments: initialPayments,
    totalPaid,
    totalFiado,
    status: 'concluida',
    notes: quote.notes || '',
    deliveryDate: quote.deliveryDate,
    internalNotes: quote.internalNotes,
    workStatus: quote.workStatus || 'pendente',
    hasChangesFromQuote: false,
  };

  return sale;
}

export function finalizeSale(
  sale: Sale,
  installmentsConfig?: { count: number; dueDates: string[]; amounts: number[] },
  emitReceipt: boolean = true
): { sale: Sale; receivable?: Receivable; receipt?: Receipt } {
  const now = new Date().toISOString();
  const sales = getSales();
  const companyId = sale.companyId || getCurrentCompanyId();
  const userId = sale.userId || getCurrentUserId();

  const existingIdx = sales.findIndex((s) => s.id === sale.id);
  const initialLogs: WorkLogEntry[] = sale.workLogs && sale.workLogs.length > 0 ? [...sale.workLogs] : [
    {
      id: generateUUID(),
      date: now,
      authorName: 'Sistema',
      action: 'Venda Concluída no PDV',
      newStatus: sale.workStatus || 'pendente',
      newDeliveryDate: sale.deliveryDate,
      notes: 'Ticket de acompanhamento da obra iniciado na finalização da venda.',
    },
  ];

  const finalSale: Sale = {
    ...sale,
    companyId,
    userId,
    updatedAt: now,
    createdAt: sale.createdAt || now,
    code: sale.code || getNextSaleCode(),
    status: 'concluida',
    workLogs: initialLogs,
  };

  let receivable: Receivable | undefined = undefined;

  // 1. Criar lançamento no Contas a Receber se houver valor Fiado > 0
  if (finalSale.totalFiado > 0) {
    const count = installmentsConfig?.count || 1;
    const installments: Installment[] = [];
    
    for (let i = 0; i < count; i++) {
      const amount = installmentsConfig?.amounts[i] ?? Math.round((finalSale.totalFiado / count) * 100) / 100;
      const dueDate = installmentsConfig?.dueDates[i] || new Date(Date.now() + (i + 1) * 30 * 86400000).toISOString().split('T')[0];
      
      installments.push({
        id: generateUUID(),
        number: i + 1,
        dueDate,
        amount,
        paidAmount: 0,
        status: 'pendente',
      });
    }

    receivable = {
      id: generateUUID(),
      companyId,
      userId,
      clientId: finalSale.clientId,
      code: `CR-${Date.now().toString().slice(-6)}`,
      saleId: finalSale.id,
      saleCode: finalSale.code,
      quoteId: finalSale.quoteId,
      quoteCode: finalSale.quoteCode,
      clientName: finalSale.clientName || 'Cliente',
      clientPhone: finalSale.clientPhone || '',
      saleDate: finalSale.date,
      totalAmount: finalSale.totalFiado,
      paidAmount: 0,
      remainingAmount: finalSale.totalFiado,
      status: 'pendente',
      installments,
      createdAt: now,
      updatedAt: now,
      notes: finalSale.notes,
    };

    saveReceivable(receivable);
    finalSale.receivableId = receivable.id;
  }

  let receipt: Receipt | undefined = undefined;

  // 2. Se habilitado "Emitir Recibo", gera recibo automaticamente com detalhamento
  if (emitReceipt) {
    const paymentMethodsSummary = finalSale.payments
      .map((p) => {
        const labels: Record<PaymentMethod, string> = {
          pix: 'PIX',
          dinheiro: 'Dinheiro',
          cartao_credito: 'Cartão Crédito',
          cartao_debito: 'Cartão Débito',
          transferencia: 'Transferência',
          fiado: 'Fiado',
        };
        return `${labels[p.method] || p.method}: R$ ${p.amount.toFixed(2)}`;
      })
      .join(' | ');

    let installmentsSummary = '';
    if (receivable && receivable.installments.length > 0) {
      const count = receivable.installments.length;
      const firstAmount = receivable.installments[0].amount.toFixed(2);
      installmentsSummary = `${count}x de R$ ${firstAmount}`;
    }

    const itemsSummary = finalSale.items.map((i) => i.name).join(', ');

    receipt = saveReceipt({
      companyId,
      userId,
      clientId: finalSale.clientId,
      clientName: finalSale.clientName || 'Cliente',
      clientPhone: finalSale.clientPhone,
      amount: finalSale.totalPaid,
      service: itemsSummary || 'Produtos / Serviços de Vidraçaria',
      date: finalSale.date,
      quoteId: finalSale.quoteId,
      quoteCode: finalSale.quoteCode,
      saleId: finalSale.id,
      saleCode: finalSale.code,
      receivableId: receivable?.id,
      saleTotalAmount: finalSale.total,
      salePaidAmount: finalSale.totalPaid,
      saleFiadoAmount: finalSale.totalFiado,
      paymentMethodsSummary,
      installmentsSummary,
      notes: finalSale.notes,
    });

    finalSale.receiptId = receipt.id;
    if (receivable) {
      receivable.receiptId = receipt.id;
      saveReceivable(receivable);
    }
  }

  // 3. Salvar Venda no histórico
  if (existingIdx !== -1) {
    sales[existingIdx] = finalSale;
  } else {
    sales.unshift(finalSale);
  }
  storageAdapter.setItem(SALES_KEY, sales);
  autoSyncEntityChange('sales', 'upsert', finalSale);

  // 3.1 Registrar pagamentos à vista/imediatos no Módulo de Caixa
  if (finalSale.payments && finalSale.payments.length > 0) {
    recordSaleCashPayments(
      finalSale.id,
      finalSale.code,
      finalSale.clientName || 'Cliente',
      finalSale.date,
      finalSale.payments
    );
  }

  // 4. Se a venda veio de um orçamento, atualizar o orçamento com status 'convertido'
  if (finalSale.quoteId) {
    const quotes = getQuotes();
    const qIdx = quotes.findIndex((q) => q.id === finalSale.quoteId);
    if (qIdx !== -1) {
      quotes[qIdx].status = 'convertido';
      quotes[qIdx].convertedAt = now;
      quotes[qIdx].convertedSaleId = finalSale.id;
      quotes[qIdx].convertedSaleCode = finalSale.code;
      quotes[qIdx].updatedAt = now;
      storageAdapter.setItem('smart_vidros_quotes', quotes);
      autoSyncEntityChange('quotes', 'upsert', quotes[qIdx]);
    }
  }

  return { sale: finalSale, receivable, receipt };
}

export function deleteSale(id: string): void {
  const sales = getSales();
  const targetSale = sales.find((s) => s.id === id);

  if (targetSale) {
    // 1. Apagar Contas a Receber associado
    if (targetSale.receivableId) {
      deleteReceivable(targetSale.receivableId);
    }

    // 2. Apagar Recibo associado se houver
    if (targetSale.receiptId) {
      deleteReceipt(targetSale.receiptId);
    }

    // 3. Se a venda veio de um orçamento, restaurar status do orçamento para 'aprovado'
    if (targetSale.quoteId) {
      const quotes = getQuotes();
      const qIdx = quotes.findIndex((q) => q.id === targetSale.quoteId);
      if (qIdx !== -1) {
        quotes[qIdx].status = 'aprovado';
        delete quotes[qIdx].convertedSaleId;
        delete quotes[qIdx].convertedSaleCode;
        delete quotes[qIdx].convertedAt;
        quotes[qIdx].updatedAt = new Date().toISOString();
        saveQuote(quotes[qIdx]);
      }
    }
  }

  const updatedSales = sales.filter((s) => s.id !== id);
  storageAdapter.setItem(SALES_KEY, updatedSales);
  autoSyncEntityChange('sales', 'delete', id);
}

export function updateWorkDetails(
  type: 'sale' | 'quote',
  id: string,
  details: {
    deliveryDate?: string;
    internalNotes?: string;
    workStatus?: 'pendente' | 'em_producao' | 'pronto' | 'entregue';
    logNote?: string;
    authorName?: string;
  }
): void {
  const now = new Date().toISOString();
  const author = details.authorName || 'Gestor';

  if (type === 'sale') {
    const sale = getSales().find((s) => s.id === id);
    if (sale) {
      const prevStatus = sale.workStatus || 'pendente';
      const prevDate = sale.deliveryDate;
      const currentLogs: WorkLogEntry[] = sale.workLogs ? [...sale.workLogs] : [];

      const statusLabels: Record<string, string> = {
        pendente: 'Pendente',
        em_producao: 'Em Produção',
        pronto: 'Pronto / Ag. Instalação',
        entregue: 'Concluído / Entregue',
      };

      const statusChanged = details.workStatus && details.workStatus !== prevStatus;
      const dateChanged = details.deliveryDate !== undefined && details.deliveryDate !== prevDate;
      const noteAdded = Boolean(details.logNote?.trim());

      if (statusChanged || dateChanged || noteAdded) {
        let actionDesc = 'Atualização do Ticket';
        if (statusChanged && dateChanged) {
          actionDesc = `Status para [${statusLabels[details.workStatus!] || details.workStatus}] e novo prazo`;
        } else if (statusChanged) {
          actionDesc = `Status alterado: ${statusLabels[prevStatus] || prevStatus} ➔ ${statusLabels[details.workStatus!] || details.workStatus}`;
        } else if (dateChanged) {
          actionDesc = `Prazo de entrega alterado para ${details.deliveryDate ? details.deliveryDate.split('-').reverse().join('/') : 'Não definido'}`;
        } else if (noteAdded) {
          actionDesc = 'Registro de Acompanhamento / Nota';
        }

        currentLogs.unshift({
          id: generateUUID(),
          date: now,
          authorName: author,
          action: actionDesc,
          previousStatus: prevStatus,
          newStatus: details.workStatus || prevStatus,
          previousDeliveryDate: prevDate,
          newDeliveryDate: details.deliveryDate,
          notes: details.logNote?.trim() || details.internalNotes?.trim() || undefined,
        });
      }

      updateSale(id, {
        deliveryDate: details.deliveryDate,
        internalNotes: details.internalNotes,
        workStatus: details.workStatus,
        workLogs: currentLogs,
      });
    }
  } else {
    const quote = getQuotes().find((q) => q.id === id);
    if (quote) {
      const prevStatus = quote.workStatus || 'pendente';
      const prevDate = quote.deliveryDate;
      const currentLogs: WorkLogEntry[] = quote.workLogs ? [...quote.workLogs] : [];

      const statusLabels: Record<string, string> = {
        pendente: 'Pendente',
        em_producao: 'Em Produção',
        pronto: 'Pronto / Ag. Instalação',
        entregue: 'Concluído / Entregue',
      };

      const statusChanged = details.workStatus && details.workStatus !== prevStatus;
      const dateChanged = details.deliveryDate !== undefined && details.deliveryDate !== prevDate;
      const noteAdded = Boolean(details.logNote?.trim());

      if (statusChanged || dateChanged || noteAdded) {
        let actionDesc = 'Atualização do Ticket';
        if (statusChanged && dateChanged) {
          actionDesc = `Status para [${statusLabels[details.workStatus!] || details.workStatus}] e novo prazo`;
        } else if (statusChanged) {
          actionDesc = `Status alterado: ${statusLabels[prevStatus] || prevStatus} ➔ ${statusLabels[details.workStatus!] || details.workStatus}`;
        } else if (dateChanged) {
          actionDesc = `Prazo de entrega alterado para ${details.deliveryDate ? details.deliveryDate.split('-').reverse().join('/') : 'Não definido'}`;
        } else if (noteAdded) {
          actionDesc = 'Registro de Acompanhamento / Nota';
        }

        currentLogs.unshift({
          id: generateUUID(),
          date: now,
          authorName: author,
          action: actionDesc,
          previousStatus: prevStatus,
          newStatus: details.workStatus || prevStatus,
          previousDeliveryDate: prevDate,
          newDeliveryDate: details.deliveryDate,
          notes: details.logNote?.trim() || details.internalNotes?.trim() || undefined,
        });
      }

      saveQuote({
        ...quote,
        deliveryDate: details.deliveryDate,
        internalNotes: details.internalNotes,
        workStatus: details.workStatus,
        workLogs: currentLogs,
      });
    }
  }
}

export function addWorkLogEntry(
  type: 'sale' | 'quote',
  id: string,
  entry: { action?: string; notes: string; authorName?: string }
): void {
  updateWorkDetails(type, id, {
    logNote: entry.notes,
    authorName: entry.authorName,
  });
}
