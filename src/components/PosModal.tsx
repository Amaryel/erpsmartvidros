import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  DollarSign,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ReceiptText,
  User,
  Phone,
  FileText,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Edit2,
  FileSearch,
  ShoppingCart,
  UserPlus,
  RefreshCw,
  Percent,
  Tag,
  Check,
  ChevronRight,
  Info,
  Package,
  Wrench,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  Sale,
  QuoteItem,
  PaymentMethod,
  SalePayment,
  DiscountType,
  CatalogItem,
  CompanyInfo,
  Quote,
  Client
} from '../types';
import { getCatalog, createSaleFromQuote, getClients, findClientByName, updateQuoteStatus } from '../services/storage';
import { UnregisteredClientPromptModal } from './UnregisteredClientPromptModal';
import { ClientFormModal } from './ClientFormModal';
import { ClientSelect } from './ClientSelect';
import { ImportQuoteModal } from './ImportQuoteModal';

interface PosModalProps {
  initialQuote?: Quote | null;
  initialSale?: Sale | null;
  companyInfo: CompanyInfo;
  onClose: () => void;
  onFinalizeSale: (
    sale: Sale,
    installmentsConfig: { count: number; dueDates: string[]; amounts: number[] },
    emitReceipt: boolean,
    generateContract?: boolean
  ) => void;
}

export const PosModal: React.FC<PosModalProps> = ({
  initialQuote,
  initialSale,
  companyInfo,
  onClose,
  onFinalizeSale,
}) => {
  const catalog = getCatalog();

  // Se veio de um orçamento, gerar rascunho de venda
  const draftBase: Sale = initialSale
    ? initialSale
    : initialQuote
    ? createSaleFromQuote(initialQuote)
    : {
        id: 'sale-' + Date.now(),
        code: '',
        clientName: '',
        clientPhone: '',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
        subtotal: 0,
        discountType: 'fixed',
        discountValue: 0,
        discountAmount: 0,
        total: 0,
        payments: [{ id: 'p1', method: 'pix', amount: 0, notes: 'Pagamento total' }],
        totalPaid: 0,
        totalFiado: 0,
        status: 'concluida',
        notes: '',
        hasChangesFromQuote: false,
      };

  const [clientName, setClientName] = useState(draftBase.clientName || '');
  const [clientPhone, setClientPhone] = useState(draftBase.clientPhone || '');
  const [saleDate, setSaleDate] = useState(draftBase.date || new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<QuoteItem[]>(draftBase.items || []);
  const [discountType, setDiscountType] = useState<DiscountType>(draftBase.discountType || 'fixed');
  const [discountValue, setDiscountValue] = useState<number>(draftBase.discountValue || 0);
  const [notes, setNotes] = useState<string>(draftBase.notes || '');
  const [deliveryDate, setDeliveryDate] = useState<string>(draftBase.deliveryDate || '');
  const [internalNotes, setInternalNotes] = useState<string>(draftBase.internalNotes || '');

  // Informações de Orçamento Importado
  const [importedQuoteInfo, setImportedQuoteInfo] = useState<{ id?: string; code?: string } | null>(
    initialQuote ? { id: initialQuote.id, code: initialQuote.code } : null
  );
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // Formas de pagamento
  const [payments, setPayments] = useState<SalePayment[]>(
    draftBase.payments.length > 0
      ? draftBase.payments
      : [{ id: 'p1', method: 'pix', amount: draftBase.total || 0 }]
  );

  // Configuração de parcelamento do fiado
  const [installmentCount, setInstallmentCount] = useState<number>(1);
  const [installmentDueDates, setInstallmentDueDates] = useState<string[]>([]);
  const [installmentAmounts, setInstallmentAmounts] = useState<number[]>([]);

  // Diálogos de confirmação pós-venda (Recibo e Contrato)
  const [postSaleStep, setPostSaleStep] = useState<'receipt' | 'contract' | null>(null);
  const [emitReceiptChoice, setEmitReceiptChoice] = useState<boolean>(true);
  const [completedSaleResult, setCompletedSaleResult] = useState<Sale | null>(null);

  // Seleção rápida do catálogo
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');

  // Modais de Cadastro Rápido de Cliente no PDV
  const [registeredClients, setRegisteredClients] = useState<Client[]>([]);
  const [showUnregisteredPrompt, setShowUnregisteredPrompt] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
    setRegisteredClients(getClients());
  }, []);

  // Re-calcular Subtotal
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Re-calcular Desconto e Total
  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = (subtotal * (discountValue || 0)) / 100;
  } else {
    discountAmount = discountValue || 0;
  }
  const totalSale = Math.max(0, subtotal - discountAmount);

  // Somatório das Formas de Pagamento
  const totalPaid = payments
    .filter((p) => p.method !== 'fiado')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalFiado = payments
    .filter((p) => p.method === 'fiado')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPaymentsAdded = totalPaid + totalFiado;
  const remainingToDefine = totalSale - totalPaymentsAdded;
  const isBalanceValid = Math.abs(remainingToDefine) < 0.01;

  // Atualiza valores de parcelamento sempre que totalFiado ou número de parcelas mudar
  useEffect(() => {
    if (totalFiado > 0) {
      const basePerInst = Math.round((totalFiado / installmentCount) * 100) / 100;
      const amounts: number[] = [];
      const dueDates: string[] = [];
      let sum = 0;

      for (let i = 0; i < installmentCount; i++) {
        if (i === installmentCount - 1) {
          amounts.push(Math.round((totalFiado - sum) * 100) / 100);
        } else {
          amounts.push(basePerInst);
          sum += basePerInst;
        }

        // Se a data já foi informada/alterada manualmente pelo usuário no estado, preserva a escolha
        if (installmentDueDates[i]) {
          dueDates.push(installmentDueDates[i]);
        } else {
          const d = new Date((saleDate || new Date().toISOString().split('T')[0]) + 'T00:00:00');
          d.setMonth(d.getMonth() + (i + 1));
          dueDates.push(d.toISOString().split('T')[0]);
        }
      }

      setInstallmentAmounts(amounts);
      setInstallmentDueDates(dueDates);
    }
  }, [totalFiado, installmentCount, saleDate]);

  // Se for o primeiro carregamento e tiver apenas 1 forma de pagamento, preenche o valor total
  useEffect(() => {
    if (payments.length === 1 && payments[0].amount === 0 && totalSale > 0) {
      setPayments([{ ...payments[0], amount: totalSale }]);
    }
  }, [totalSale]);

  // Handler para importar orçamento
  const handleSelectQuoteFromModal = (selectedQuote: Quote) => {
    setShowImportModal(false);
    setClientName(selectedQuote.clientName || '');
    setClientPhone(selectedQuote.clientPhone || '');
    setItems(JSON.parse(JSON.stringify(selectedQuote.items || [])));
    setDiscountType(selectedQuote.discountType || 'fixed');
    setDiscountValue(selectedQuote.discountValue || 0);
    setNotes(selectedQuote.notes || '');
    setDeliveryDate(selectedQuote.deliveryDate || '');
    setInternalNotes(selectedQuote.internalNotes || '');
    setImportedQuoteInfo({ id: selectedQuote.id, code: selectedQuote.code });

    const qTotal = selectedQuote.total || 0;
    if (selectedQuote.downPaymentAmount && selectedQuote.downPaymentAmount > 0) {
      const down = selectedQuote.downPaymentAmount;
      const rest = Math.max(0, qTotal - down);
      setPayments([
        { id: 'p-down', method: selectedQuote.downPaymentMethod || 'pix', amount: down, notes: 'Entrada do Orçamento' },
        ...(rest > 0 ? [{ id: 'p-rest', method: 'pix' as PaymentMethod, amount: rest, notes: 'Saldo restante' }] : [])
      ]);
    } else {
      setPayments([{ id: 'p1', method: 'pix', amount: qTotal, notes: 'Pagamento total' }]);
    }

    setImportMessage(`✓ Orçamento ${selectedQuote.code} (${selectedQuote.clientName || 'Cliente'}) importado com sucesso!`);
    setTimeout(() => setImportMessage(null), 6000);
  };

  // Limpar Venda / Carrinho
  const handleClearCart = () => {
    if (items.length > 0) {
      if (!confirm('Deseja realmente limpar todos os itens da venda?')) return;
    }
    setItems([]);
    setDiscountValue(0);
    setClientName('');
    setClientPhone('');
    setNotes('');
    setImportedQuoteInfo(null);
    setPayments([{ id: 'p1', method: 'pix', amount: 0 }]);
  };

  // Adicionar Item do Catálogo
  const handleAddItemFromCatalog = () => {
    if (!selectedCatalogId) return;
    const catItem = catalog.find((c) => c.id === selectedCatalogId);
    if (!catItem) return;

    if (catItem.type === 'dimensao') {
      const lengthMm = 1000;
      const widthMm = 1000;
      const areaM2 = 1.0;
      const totalPrice = catItem.defaultPrice;
      const newItem: QuoteItem = {
        id: 'item-' + Date.now(),
        type: 'dimensao',
        name: catItem.name,
        description: catItem.description,
        lengthMm,
        widthMm,
        areaM2,
        pricePerM2: catItem.defaultPrice,
        quantity: 1,
        totalPrice,
      };
      setItems([...items, newItem]);
    } else {
      const newItem: QuoteItem = {
        id: 'item-' + Date.now(),
        type: 'simples',
        name: catItem.name,
        description: catItem.description,
        unitPrice: catItem.defaultPrice,
        quantity: 1,
        totalPrice: catItem.defaultPrice,
      };
      setItems([...items, newItem]);
    }
    setSelectedCatalogId('');
  };

  const handleAddCustomItem = () => {
    const newItem: QuoteItem = {
      id: 'item-' + Date.now(),
      type: 'simples',
      name: 'Novo Item / Serviço',
      unitPrice: 100,
      quantity: 1,
      totalPrice: 100,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, updatedFields: Partial<QuoteItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newItem = { ...item, ...updatedFields };

        if (newItem.type === 'dimensao') {
          const l = newItem.lengthMm || 0;
          const w = newItem.widthMm || 0;
          const area = Math.round(((l / 1000) * (w / 1000)) * 10000) / 10000;
          newItem.areaM2 = area;
          newItem.totalPrice = Math.round(area * (newItem.pricePerM2 || 0) * (newItem.quantity || 1) * 100) / 100;
        } else {
          newItem.totalPrice = Math.round((newItem.unitPrice || 0) * (newItem.quantity || 1) * 100) / 100;
        }

        return newItem;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  // Preset rápido de pagamento integral
  const handleQuickPresetPayment = (method: PaymentMethod) => {
    setPayments([{ id: 'p-preset-' + Date.now(), method, amount: totalSale, notes: 'Pagamento total' }]);
  };

  // Formas de pagamento
  const handleAddPayment = () => {
    const remaining = Math.max(0, totalSale - totalPaymentsAdded);
    setPayments([
      ...payments,
      {
        id: 'pay-' + Date.now(),
        method: 'pix',
        amount: Math.round(remaining * 100) / 100,
      },
    ]);
  };

  const handleUpdatePayment = (id: string, field: keyof SalePayment, val: any) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, [field]: val };
      })
    );
  };

  const handleRemovePayment = (id: string) => {
    if (payments.length <= 1) return;
    setPayments(payments.filter((p) => p.id !== id));
  };

  const handleAutoFillPayment = (id: string) => {
    const otherSum = payments
      .filter((p) => p.id !== id)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const fillAmount = Math.max(0, totalSale - otherSum);
    handleUpdatePayment(id, 'amount', Math.round(fillAmount * 100) / 100);
  };

  const executeFinalizeSale = () => {
    const targetQuoteId = importedQuoteInfo?.id || initialQuote?.id || draftBase.quoteId;
    const targetQuoteCode = importedQuoteInfo?.code || initialQuote?.code || draftBase.quoteCode;

    // Se houve orçamento associado, marcar orçamento como APROVADO
    if (targetQuoteId) {
      updateQuoteStatus(targetQuoteId, 'aprovado');
    }

    let hasChanges = false;
    if (initialQuote) {
      if (
        initialQuote.total !== totalSale ||
        initialQuote.items.length !== items.length ||
        initialQuote.clientName !== clientName
      ) {
        hasChanges = true;
      }
    }

    const saleObject: Sale = {
      id: draftBase.id,
      code: draftBase.code,
      quoteId: targetQuoteId,
      quoteCode: targetQuoteCode,
      clientName: clientName.trim() || 'Cliente Não Informado',
      clientPhone: clientPhone.trim(),
      date: saleDate,
      createdAt: draftBase.createdAt,
      updatedAt: new Date().toISOString(),
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      total: totalSale,
      payments,
      totalPaid,
      totalFiado,
      status: 'concluida',
      notes,
      deliveryDate: deliveryDate || undefined,
      internalNotes: internalNotes.trim() || undefined,
      workStatus: draftBase.workStatus || 'pendente',
      hasChangesFromQuote: hasChanges,
    };

    setCompletedSaleResult(saleObject);
    setPostSaleStep('receipt');
  };

  // Submeter Venda
  const handlePreFinalize = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Adicione pelo menos um produto ou serviço na venda.');
      return;
    }

    if (!isBalanceValid) {
      alert('O valor total das formas de pagamento deve ser exatamente igual ao total da venda.');
      return;
    }

    const trimmedName = clientName.trim();
    if (trimmedName && trimmedName !== 'Cliente Não Informado') {
      const existingClient = findClientByName(trimmedName);
      if (!existingClient) {
        setShowUnregisteredPrompt(true);
        return;
      }
    }

    executeFinalizeSale();
  };

  const handleFinalizeWithReceipt = () => {
    if (!completedSaleResult) return;
    setPostSaleStep(null);
    onFinalizeSale(
      completedSaleResult,
      {
        count: installmentCount,
        dueDates: installmentDueDates,
        amounts: installmentAmounts,
      },
      true,
      false
    );
  };

  const handleFinalizeWithContract = () => {
    if (!completedSaleResult) return;
    setPostSaleStep(null);
    onFinalizeSale(
      completedSaleResult,
      {
        count: installmentCount,
        dueDates: installmentDueDates,
        amounts: installmentAmounts,
      },
      false,
      true
    );
  };

  const handleFinalizeWithBoth = () => {
    if (!completedSaleResult) return;
    setPostSaleStep(null);
    onFinalizeSale(
      completedSaleResult,
      {
        count: installmentCount,
        dueDates: installmentDueDates,
        amounts: installmentAmounts,
      },
      true,
      true
    );
  };

  const handleFinalizeSimple = () => {
    if (!completedSaleResult) return;
    setPostSaleStep(null);
    onFinalizeSale(
      completedSaleResult,
      {
        count: installmentCount,
        dueDates: installmentDueDates,
        amounts: installmentAmounts,
      },
      false,
      false
    );
  };

  const paymentLabels: Record<PaymentMethod, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    transferencia: 'Transferência Bancária',
    fiado: 'Fiado / A Receber',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-3xl shadow-2xl w-full max-w-7xl my-2 overflow-hidden border border-slate-300 flex flex-col max-h-[96vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho de Alto Nível do PDV */}
        <div className="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-950 text-white px-5 py-3.5 flex flex-wrap items-center justify-between border-b-2 border-amber-500/60 shadow-lg shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shrink-0">
              <ShoppingCart className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Caixa / Ponto de Venda (PDV)</span>
                </h2>
                {importedQuoteInfo && (
                  <span className="text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Importado: {importedQuoteInfo.code}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/80">
                {companyInfo.name || 'Smart Vidros'} • Registro e finalização de vendas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botão Importar Orçamento */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <FileSearch className="w-4 h-4" />
              <span>Importar Orçamento</span>
            </button>

            {/* Botão Limpar Carrinho */}
            <button
              type="button"
              onClick={handleClearCart}
              title="Limpar itens da venda"
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs px-3 py-2 rounded-xl border border-zinc-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Limpar</span>
            </button>

            {/* Botão Fechar Modal */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-red-600/90 text-zinc-300 hover:text-white flex items-center justify-center transition-colors border border-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensagem Toast de Confirmação de Importação */}
        {importMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-inner animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{importMessage}</span>
            </div>
            <button onClick={() => setImportMessage(null)} className="text-emerald-200 hover:text-white text-sm font-bold">×</button>
          </div>
        )}

        {/* Corpo Principal com Scroll */}
        <form onSubmit={handlePreFinalize} className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* LADO ESQUERDO: Catálogo, Itens e Cliente (7 Colunas em telas grandes) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Card 1: Seleção Rápida de Produtos / Serviços no Catálogo */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-600" />
                    <span>Adicionar Item do Catálogo</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1"
                  >
                    <span>+ Item Avulso</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedCatalogId}
                    onChange={(e) => setSelectedCatalogId(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">Selecione um produto ou serviço do catálogo...</option>
                    {catalog
                      .filter((c) => c.status === 'ativo')
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.category === 'servico' ? '🔧' : '📦'} {item.name} — R$ {item.defaultPrice.toFixed(2)} {item.unit ? `/${item.unit}` : ''}
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddItemFromCatalog}
                    disabled={!selectedCatalogId}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
                  >
                    Adicionar +
                  </button>
                </div>
              </div>

              {/* Card 2: Carrinho de Compras / Lista de Itens */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      Itens do Pedido ({items.length})
                    </span>
                  </div>
                  <span className="text-xs text-amber-300 font-bold">
                    Subtotal: R$ {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 space-y-3 max-h-[380px] overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 space-y-2">
                      <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">O carrinho está vazio</p>
                      <p className="text-[11px] text-slate-400">
                        Adicione produtos do catálogo acima ou clique em <strong>"Importar Orçamento"</strong>.
                      </p>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 relative group hover:border-amber-400 transition-colors"
                      >
                        {/* Linha 1: Nome do Item e Botão Excluir */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                                className="font-bold text-slate-900 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white focus:outline-none w-full px-1 py-0.5 rounded"
                                placeholder="Nome do item..."
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Linha 2: Campos de Dimensão ou Preço Simples */}
                        {item.type === 'dimensao' ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block">Largura (mm)</label>
                              <input
                                type="number"
                                min="1"
                                value={item.widthMm || ''}
                                onChange={(e) => handleUpdateItem(item.id, { widthMm: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block">Altura (mm)</label>
                              <input
                                type="number"
                                min="1"
                                value={item.lengthMm || ''}
                                onChange={(e) => handleUpdateItem(item.id, { lengthMm: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block">Preço/m² (R$)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={item.pricePerM2 || ''}
                                onChange={(e) => handleUpdateItem(item.id, { pricePerM2: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block">Qtd (m² = {item.areaM2 || 0})</label>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded-l text-xs hover:bg-slate-300"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })}
                                  className="w-12 text-center bg-white border-y border-slate-300 py-1 text-xs font-bold"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(item.id, { quantity: item.quantity + 1 })}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded-r text-xs hover:bg-slate-300"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block">Preço Unitário (R$)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={item.unitPrice || ''}
                                onChange={(e) => handleUpdateItem(item.id, { unitPrice: Number(e.target.value) })}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block">Quantidade</label>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded-l text-xs hover:bg-slate-300"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })}
                                  className="w-12 text-center bg-white border-y border-slate-300 py-1 text-xs font-bold"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(item.id, { quantity: item.quantity + 1 })}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded-r text-xs hover:bg-slate-300"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="text-right flex flex-col justify-end pb-0.5">
                              <span className="text-[10px] text-slate-400 font-bold">Total do Item</span>
                              <span className="text-sm font-black text-amber-700">R$ {item.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card 3: Dados do Cliente e Observações */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>Dados do Cliente & Observações</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowClientModal(true)}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Novo Cliente</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <ClientSelect
                      clients={registeredClients}
                      selectedName={clientName}
                      selectedPhone={clientPhone}
                      onSelectClient={(c) => {
                        setClientName(c.name);
                        if (c.phone) setClientPhone(c.phone);
                      }}
                      onClear={() => {
                        setClientName('');
                        setClientPhone('');
                      }}
                      onOpenNewClientModal={() => setShowClientModal(true)}
                      placeholder="Buscar ou selecionar cliente..."
                      label="Nome do Cliente"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(89) 99991-0028"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Data da Venda</label>
                    <input
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-amber-900 uppercase block mb-1 flex items-center justify-between">
                      <span>Data Prevista para Entrega / Execução</span>
                      <span className="text-[9px] text-amber-700 font-bold lowercase">(opcional)</span>
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Observações Gerais (Para o Cliente)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observações da venda ou condições acordadas..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-amber-950 uppercase block mb-1 flex items-center justify-between">
                      <span>Anotações da Obra (Uso Interno)</span>
                      <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">Equipe</span>
                    </label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Especificações técnicas, cor do alumínio, endereço da obra..."
                      rows={2}
                      className="w-full bg-amber-50/70 border border-amber-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* LADO DIREITO: Resumo Financeiro, Formas de Pagamento e Finalização (5 Colunas) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Card Resumo Financeiro de Alto Impacto */}
              <div className="bg-gradient-to-b from-zinc-950 to-slate-900 rounded-2xl p-5 text-white border border-amber-500/40 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span>Resumo Financeiro da Venda</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-300">
                    <span>Subtotal dos Itens:</span>
                    <span className="font-bold text-white">R$ {subtotal.toFixed(2)}</span>
                  </div>

                  {/* Campo de Desconto */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-zinc-300 font-medium">Desconto:</span>
                    <div className="flex items-center gap-1">
                      <div className="inline-flex rounded-lg bg-zinc-800 p-0.5 border border-zinc-700">
                        <button
                          type="button"
                          onClick={() => setDiscountType('fixed')}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            discountType === 'fixed' ? 'bg-amber-500 text-slate-950' : 'text-zinc-400'
                          }`}
                        >
                          R$
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType('percent')}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            discountType === 'percent' ? 'bg-amber-500 text-slate-950' : 'text-zinc-400'
                          }`}
                        >
                          %
                        </button>
                      </div>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discountValue || ''}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-right text-xs font-bold text-amber-400 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-400 font-semibold text-[11px] pt-0.5">
                      <span>Desconto Aplicado:</span>
                      <span>- R$ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-zinc-800 pt-3 mt-2 flex justify-between items-baseline">
                    <span className="text-sm font-black text-white uppercase tracking-wider">Total a Pagar:</span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                      R$ {totalSale.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Formas de Pagamento */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>Formas de Pagamento</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleAddPayment}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Dividir Pgto</span>
                  </button>
                </div>

                {/* Botões Rápidos de Preset Integral */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPresetPayment('pix')}
                    className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10px] font-black text-emerald-800 transition-colors"
                  >
                    ⚡ PIX Total
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetPayment('dinheiro')}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-[10px] font-black text-slate-800 transition-colors"
                  >
                    💵 Dinheiro
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetPayment('cartao_credito')}
                    className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-[10px] font-black text-blue-800 transition-colors"
                  >
                    💳 Cartão Total
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetPayment('fiado')}
                    className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-[10px] font-black text-purple-800 transition-colors"
                  >
                    📋 Fiado / Prazo
                  </button>
                </div>

                {/* Lista de Linhas de Pagamento */}
                <div className="space-y-2.5 pt-1">
                  {payments.map((p, idx) => (
                    <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={p.method}
                          onChange={(e) => handleUpdatePayment(p.id, 'method', e.target.value as PaymentMethod)}
                          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-800 focus:outline-none flex-1"
                        >
                          <option value="pix">⚡ PIX</option>
                          <option value="dinheiro">💵 Dinheiro</option>
                          <option value="cartao_credito">💳 Cartão de Crédito</option>
                          <option value="cartao_debito">💳 Cartão de Débito</option>
                          <option value="transferencia">🏦 Transferência Bancária</option>
                          <option value="fiado">📋 Fiado / A Receber</option>
                        </select>

                        <div className="relative w-28">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={p.amount || ''}
                            onChange={(e) => handleUpdatePayment(p.id, 'amount', Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-lg pl-6 pr-2 py-1.5 text-xs font-black text-slate-900 text-right focus:outline-none"
                          />
                        </div>

                        {payments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePayment(p.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleAutoFillPayment(p.id)}
                          className="font-bold text-amber-700 hover:underline"
                        >
                          Preencher Saldo Restante
                        </button>
                        {p.notes && <span className="italic truncate max-w-[150px]">{p.notes}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Se houver FIADO, mostra opções de parcelamento */}
                {totalFiado > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-700" />
                        <span>Parcelamento do Fiado (R$ {totalFiado.toFixed(2)})</span>
                      </span>

                      <select
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(Number(e.target.value))}
                        className="bg-white border border-purple-300 rounded-lg px-2 py-1 text-xs font-bold text-purple-900"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((n) => (
                          <option key={n} value={n}>
                            {n}x {n === 1 ? 'Parcela Única' : 'Parcelas'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Prévia e Seleção Manual dos Vencimentos */}
                    <div className="space-y-2 bg-white p-2.5 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-purple-900 border-b border-purple-100 pb-1">
                        <span>Parcelas & Data de Vencimento</span>
                        <span>Valor</span>
                      </div>

                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
                        {installmentAmounts.map((amt, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-1.5 bg-purple-50/50 rounded-lg border border-purple-100"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-purple-900 shrink-0">
                                {i + 1}ª ({i + 1}/{installmentCount}):
                              </span>

                              <input
                                type="date"
                                value={installmentDueDates[i] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setInstallmentDueDates((prev) => {
                                    const next = [...prev];
                                    next[i] = val;
                                    return next;
                                  });
                                }}
                                className="bg-white border border-purple-300 rounded-md px-2 py-1 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              />
                            </div>

                            <strong className="text-xs font-black font-mono text-purple-950 shrink-0">
                              R$ {amt.toFixed(2)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-purple-700 font-medium italic pt-0.5">
                        💡 Você pode alterar a data de vencimento de qualquer parcela clicando na data acima.
                      </p>
                    </div>
                  </div>
                )}

                {/* Indicador de Conferência de Saldos */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    isBalanceValid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isBalanceValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>
                      {isBalanceValid
                        ? 'Valores conferem perfeitamente'
                        : `Falta definir R$ ${remainingToDefine.toFixed(2)}`}
                    </span>
                  </div>

                  {!isBalanceValid && (
                    <button
                      type="button"
                      onClick={() => {
                        if (payments.length > 0) handleAutoFillPayment(payments[payments.length - 1].id);
                      }}
                      className="text-[10px] font-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-1 rounded"
                    >
                      Ajustar Saldo
                    </button>
                  )}
                </div>

                {/* Botão Principal de Finalização */}
                <button
                  type="submit"
                  disabled={items.length === 0 || !isBalanceValid}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Finalizar Venda</span>
                </button>
              </div>

            </div>

          </div>
        </form>

      </div>

      {/* Modal: Importar Orçamento */}
      {showImportModal && (
        <ImportQuoteModal
          onClose={() => setShowImportModal(false)}
          onSelectQuote={handleSelectQuoteFromModal}
        />
      )}

      {/* Modal: Pergunta Cliente Não Cadastrado */}
      {showUnregisteredPrompt && (
        <UnregisteredClientPromptModal
          clientName={clientName}
          onRegister={() => {
            setShowUnregisteredPrompt(false);
            setShowClientModal(true);
          }}
          onContinueWithoutRegister={() => {
            setShowUnregisteredPrompt(false);
            executeFinalizeSale();
          }}
          onClose={() => setShowUnregisteredPrompt(false)}
        />
      )}

      {/* Modal: Cadastrar Cliente */}
      {showClientModal && (
        <ClientFormModal
          initialData={{ name: clientName, phone: clientPhone }}
          onClose={() => setShowClientModal(false)}
          onSave={(savedClient) => {
            setClientName(savedClient.name);
            setClientPhone(savedClient.phone || savedClient.whatsapp || clientPhone);
            setShowClientModal(false);
            setRegisteredClients(getClients());
            executeFinalizeSale();
          }}
          title="Cadastrar Cliente na Venda"
        />
      )}

      {/* MODAL PÓS-VENDA: ESCOLHA DE AÇÃO / DOCUMENTOS */}
      {completedSaleResult && postSaleStep && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border-2 border-emerald-500/40 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
                Venda Registrada com Sucesso
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                O que deseja fazer agora?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Cliente: <strong className="text-slate-900">{completedSaleResult.clientName}</strong> • Total: <strong className="text-emerald-700">R$ {completedSaleResult.total.toFixed(2)}</strong>
              </p>
            </div>

            <div className="space-y-2.5 pt-2 text-left">
              {/* Opção 1: Emitir & Visualizar Recibo */}
              <button
                type="button"
                onClick={handleFinalizeWithReceipt}
                className="w-full p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-between shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 text-amber-400 shrink-0">
                    <ReceiptText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-black text-sm text-slate-950">Sim, Emitir Recibo (PDF)</span>
                    <span className="block text-[11px] font-medium text-slate-800">
                      Gera o recibo na tela para salvar, imprimir ou enviar
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Opção 2: Gerar Contrato */}
              <button
                type="button"
                onClick={handleFinalizeWithContract}
                className="w-full p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-md hover:shadow-lg transition-all cursor-pointer group border border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-black text-sm text-white">Gerar Contrato de Serviço</span>
                    <span className="block text-[11px] font-medium text-slate-300">
                      Abrir formulário e gerar contrato da obra
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Opção 3: Ambos */}
              <button
                type="button"
                onClick={handleFinalizeWithBoth}
                className="w-full p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>📄 Emitir Recibo & 📜 Gerar Contrato</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Ambos</span>
              </button>

              {/* Opção 4: Apenas Concluir */}
              <button
                type="button"
                onClick={handleFinalizeSimple}
                className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Concluir sem emitir documentos agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
